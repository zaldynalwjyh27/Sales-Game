'use server';

import { prisma } from '@/lib/prisma';
import { triggerPusher } from '@/lib/pusher-server';
import { handleAIResponse } from '@/lib/ai-handler';
import { JISR_SCENARIOS, QUESTION_TYPES, CHALLENGE_CARDS } from '@/lib/jisr-constants';
import { revalidatePath } from 'next/cache';

export async function createRoom(hostName: string) {
  const room = await prisma.room.create({
    data: {
      status: 'LOBBY',
      players: {
        create: {
          name: hostName,
          isHost: true,
          role: 'EVALUATOR', // Host starts as evaluator
        },
      },
    },
    include: {
      players: true,
    },
  });
  return room;
}

export async function joinRoom(roomId: string, playerName: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'LOBBY') {
    throw new Error('Cannot join room after session has started');
  }

  const player = await prisma.player.create({
    data: {
      roomId,
      name: playerName,
      isHost: false,
      isLocked: false,
    },
  });

  await triggerPusher(`room-${roomId}`, 'player-joined', {
    id: player.id,
    name: player.name,
    role: player.role,
    isHost: player.isHost,
    roomId: player.roomId,
  });
  return player;
}

// Update player name (only before session starts)
export async function updatePlayerName(roomId: string, playerId: string, newName: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'LOBBY') {
    throw new Error('Cannot update player name after session has started');
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: playerId },
    data: { name: newName },
  });

  return updatedPlayer;
}

// Remove player (admin only feature)
export async function removePlayer(roomId: string, playerId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { players: true },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'LOBBY') {
    throw new Error('Cannot remove player after session has started');
  }

  // Verify that the player is trying to remove themselves or is the host
  const playerToRemove = room.players.find(p => p.id === playerId);
  if (!playerToRemove) {
    throw new Error('Player not found in room');
  }

  await prisma.player.delete({
    where: { id: playerId },
  });

  // Trigger event to notify other players
  await triggerPusher(`room-${roomId}`, 'player-left', { playerId });
  
  return { success: true };
}

// Admin settings for question bank
export async function updateRoomSettings(
  roomId: string,
  questionCount: number,
  questionType: string
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  // Only allow updates before session starts
  if (room.status !== 'LOBBY') {
    throw new Error('Cannot update settings after session has started');
  }

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      questionCount,
      questionType,
    },
  });

  return updatedRoom;
}

export async function resetRoomToLobby(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) throw new Error('Room not found');

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      status: 'LOBBY',
      currentRound: 1,
    },
    include: { players: true },
  });

  // Clear evaluations and scores for a fresh start
  await prisma.evaluation.deleteMany({ where: { roomId } });
  await prisma.playerScore.deleteMany({ where: { roomId } });

  await triggerPusher(`room-${roomId}`, 'game-started', {
    id: updatedRoom.id,
    status: updatedRoom.status,
    scenarioId: updatedRoom.scenarioId,
    currentRound: updatedRoom.currentRound,
    players: updatedRoom.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      isHost: p.isHost,
      roomId: p.roomId,
    })),
  });

  return updatedRoom;
}

// Random role assignment
export async function assignRandomRoles(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { players: true },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  if (room.status !== 'LOBBY') {
    throw new Error('Cannot assign roles after session has started');
  }

  // Use ALL players for rotation, including host
  const players = await prisma.player.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' }
  });
  
  if (players.length < 2) {
    throw new Error('Not enough players to start the session');
  }

  // Assign roles based on fixed index
  const assignments = players.map((player, index) => {
    let role = 'EVALUATOR';
    if (index === 0) role = 'SELLER';
    else if (index === 1) role = 'CLIENT';
    
    return { playerId: player.id, role };
  });

  // Update all players with their assigned roles and initialize rolesHistory
  await Promise.all(
    assignments.map(async (a) => {
      // Get the current player to access their rolesHistory
      const currentPlayer = await prisma.player.findUnique({
        where: { id: a.playerId },
      });
      
      let history: string[] = [];
      if (currentPlayer?.rolesHistory) {
        history = JSON.parse(currentPlayer.rolesHistory);
      }
      
      // Add the new role if not already in history
      if (!history.includes(a.role)) {
        history.push(a.role);
      }
      
      return prisma.player.update({
        where: { id: a.playerId },
        data: { 
          role: a.role,
          rolesHistory: JSON.stringify(history)
        },
      });
    })
  );

  // Select scenario based on question type
  let filteredScenarios = JISR_SCENARIOS;
  if (room.questionType && room.questionType !== 'MIXED') {
    filteredScenarios = JISR_SCENARIOS.filter(scenario => 
      scenario.questionType === room.questionType
    );
  }
  
  // If no scenarios match the type, fall back to all scenarios
  if (filteredScenarios.length === 0) {
    filteredScenarios = JISR_SCENARIOS;
  }
  
  const scenario = filteredScenarios[Math.floor(Math.random() * filteredScenarios.length)];

  // Generate random challenge for the session
  const challenge = CHALLENGE_CARDS[Math.floor(Math.random() * CHALLENGE_CARDS.length)];
  await prisma.challenge.create({
    data: {
      roomId,
      challenge: challenge.challenge,
    },
  });

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: {
      status: 'IN_PROGRESS',
      scenarioId: scenario.id,
    },
    include: { players: true },
  });

  // Send minimal payload to stay under Pusher's 10KB limit
  await triggerPusher(`room-${roomId}`, 'game-started', {
    id: updatedRoom.id,
    status: updatedRoom.status,
    scenarioId: updatedRoom.scenarioId,
    currentRound: updatedRoom.currentRound,
    players: updatedRoom.players.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      isHost: p.isHost,
      roomId: p.roomId,
    })),
  });
  return updatedRoom;
}

export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string
) {
  const message = await prisma.message.create({
    data: {
      roomId,
      senderId,
      content,
      isAi: false,
    },
    include: {
      sender: true,
    },
  });

  await triggerPusher(`room-${roomId}`, 'new-message', {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    isAi: message.isAi,
    sender: message.sender
      ? { name: message.sender.name, role: message.sender.role }
      : null,
  });

  // Check if we need AI to respond
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      players: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!room) return message;

  const hasHumanClient = room.players.some((p) => p.role === 'CLIENT');
  const senderRole = room.players.find((p) => p.id === senderId)?.role;

  // If sender is Seller and there's no Human Client, AI plays Client
  if (senderRole === 'SELLER' && !hasHumanClient) {
    handleAIResponse(roomId, room.scenarioId!, room.messages);
  }

  return message;
}

export async function submitEvaluation(
  roomId: string,
  evaluatorId: string,
  targetId: string,
  scores: Record<number, number>,
  notes?: string
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { players: true, evaluations: true },
  });

  if (!room) throw new Error('Room not found');

  const evaluation = await prisma.evaluation.create({
    data: {
      roomId,
      evaluatorId,
      targetId,
      roundNumber: room.currentRound,
      scores: JSON.stringify(scores),
      notes: notes || null,
      revealed: false,
    },
  });

  await triggerPusher(`room-${roomId}`, 'evaluation-submitted', { evaluatorId });
  revalidatePath(`/room/${roomId}`);

  // Re-fetch room to get updated evaluations
  const updatedRoom = await prisma.room.findUnique({
    where: { id: roomId },
    include: { players: true, evaluations: true },
  });

  if (updatedRoom) {
    const evaluators = updatedRoom.players.filter(p => p.role === 'EVALUATOR');
    const evaluationsThisRound = updatedRoom.evaluations.filter(e => e.roundNumber === updatedRoom.currentRound);
    
    // If everyone who should evaluate has evaluated
    if (evaluationsThisRound.length >= evaluators.length) {
      // Auto-progress to next round
      await nextRound(roomId);
    }
  }

  return evaluation;
}

export async function revealEvaluations(roomId: string) {
  await prisma.evaluation.updateMany({
    where: { roomId },
    data: { revealed: true },
  });

  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'REVEALED' },
  });

  await triggerPusher(`room-${roomId}`, 'evaluations-revealed', {});
}

export async function updatePartialEvaluation(
  roomId: string,
  evaluatorId: string,
  targetId: string,
  questionIndex: number,
  score: number
) {
  const existingEval = await prisma.evaluation.findFirst({
    where: { roomId, evaluatorId, targetId },
  });

  let scores: Record<number, number> = {};
  if (existingEval) {
    scores = JSON.parse(existingEval.scores);
    scores[questionIndex] = score;
    
    await prisma.evaluation.update({
      where: { id: existingEval.id },
      data: { scores: JSON.stringify(scores) },
    });
  } else {
    scores[questionIndex] = score;
    await prisma.evaluation.create({
      data: {
        roomId,
        evaluatorId,
        targetId,
        scores: JSON.stringify(scores),
        revealed: false,
      },
    });
  }

  return { success: true };
}

export async function nextRound(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { 
      players: { orderBy: { createdAt: 'asc' } },
      evaluations: true 
    },
  });
  if (!room) return;

  // 1. Save round scores
  const playerScoresMap: Record<string, number[]> = {};
  const evaluationsThisRound = room.evaluations.filter(e => e.roundNumber === room.currentRound);
  
  evaluationsThisRound.forEach(evaluation => {
    if (!playerScoresMap[evaluation.targetId]) playerScoresMap[evaluation.targetId] = [];
    const scores = JSON.parse(evaluation.scores) as Record<number, number>;
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    playerScoresMap[evaluation.targetId].push(avgScore);
  });

  for (const [playerId, scores] of Object.entries(playerScoresMap)) {
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    await prisma.playerScore.create({
      data: { playerId, roomId, roundNumber: room.currentRound, totalScore: avgScore },
    });
  }

  // 2. Clear current round data (MESSAGES ONLY, KEEP EVALUATIONS)
  await prisma.message.deleteMany({ where: { roomId } });

  // 3. Update rolesHistory with the roles they JUST played
  console.log(`[NextRound] Updating history for round ${room.currentRound}`);
  await Promise.all(
    room.players.map(async (p) => {
      const history = JSON.parse(p.rolesHistory || "[]") as string[];
      if (p.role && !history.includes(p.role)) {
        history.push(p.role);
        console.log(`[NextRound] Player ${p.name} now has history: ${JSON.stringify(history)}`);
        return prisma.player.update({
          where: { id: p.id },
          data: { rolesHistory: JSON.stringify(history) },
        });
      }
    })
  );

  // Re-fetch players after history update
  const updatedPlayers = await prisma.player.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' }
  });
  
  const everyonePlayedAllRoles = updatedPlayers.every(p => {
    const history = JSON.parse(p.rolesHistory || "[]") as string[];
    return history.includes('SELLER') && 
           history.includes('CLIENT') && 
           history.includes('EVALUATOR');
  });

  console.log(`[NextRound] Everyone played all roles: ${everyonePlayedAllRoles}`);
  console.log(`[NextRound] Current round: ${room.currentRound}, Total players: ${updatedPlayers.length}`);

  // Game ends if everyone has played all roles 
  // OR if we've reached a number of rounds equal to players
  const shouldEnd = updatedPlayers.length >= 3 
    ? (everyonePlayedAllRoles && room.currentRound >= updatedPlayers.length)
    : (updatedPlayers.every(p => {
        const h = JSON.parse(p.rolesHistory || "[]");
        return h.includes('SELLER') && h.includes('CLIENT');
      }) && room.currentRound >= updatedPlayers.length);

  if (shouldEnd) {
    console.log(`[NextRound] Ending game for room ${roomId}`);
    await prisma.room.update({ where: { id: roomId }, data: { status: 'FINISHED' } });
    await triggerPusher(`room-${roomId}`, 'game-finished', {});
    return;
  }

  // 4. Strict Circular Role Rotation for NEXT round
  const nextRoundNumber = room.currentRound + 1;
  console.log(`[NextRound] Moving to round ${nextRoundNumber}`);
  
  const assignments = updatedPlayers.map((p, index) => {
    // Role rotation logic for ALL players:
    const sellerIndex = (room.currentRound) % updatedPlayers.length;
    const clientIndex = (room.currentRound + 1) % updatedPlayers.length;
    
    let role = 'EVALUATOR';
    if (index === sellerIndex) role = 'SELLER';
    else if (index === clientIndex) role = 'CLIENT';
    
    return { playerId: p.id, role };
  });

  // 5. Update Database for NEXT round roles
  await Promise.all(
    assignments.map(async (a) => {
      return prisma.player.update({
        where: { id: a.playerId },
        data: { role: a.role },
      });
    })
  );

  // 6. Get new scenario
  let filteredScenarios = JISR_SCENARIOS;
  if (room.questionType && room.questionType !== 'MIXED') {
    filteredScenarios = JISR_SCENARIOS.filter(s => s.questionType === room.questionType);
  }
  const scenario = (filteredScenarios.length ? filteredScenarios : JISR_SCENARIOS)[Math.floor(Math.random() * filteredScenarios.length)];

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: { status: 'IN_PROGRESS', scenarioId: scenario.id, currentRound: nextRoundNumber },
    include: { players: true },
  });

  await triggerPusher(`room-${roomId}`, 'next-round', {
    id: updatedRoom.id,
    status: updatedRoom.status,
    scenarioId: updatedRoom.scenarioId,
    currentRound: updatedRoom.currentRound,
    players: updatedRoom.players.map((p) => ({
      id: p.id, name: p.name, role: p.role, isHost: p.isHost, roomId: p.roomId,
    })),
  });
  revalidatePath(`/room/${roomId}`);
}
export async function closeRoomForEveryone(roomId: string) {
  await triggerPusher(`room-${roomId}`, 'room-closed', {});
  await prisma.room.update({
    where: { id: roomId },
    data: { status: 'CLOSED' }
  });
  revalidatePath(`/room/${roomId}`);
}
