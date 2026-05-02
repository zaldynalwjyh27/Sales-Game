# API Endpoints and Data Models Documentation

## Next.js Route Handlers

### Public Routes
- `/` - Homepage for creating/joining rooms
- `/room/[id]?player=[playerId]` - Room page requiring player ID

## Server Actions API

### Room Management Actions

#### `createRoom(hostName: string)`
- **Purpose**: Create a new room with a host player
- **Input**: Host's name
- **Output**: Created room object with host player
- **Side Effects**: Creates host player record
- **Usage**: Called when creating a new room from homepage

#### `joinRoom(roomId: string, playerName: string)`
- **Purpose**: Add a new player to an existing room
- **Input**: Room ID and player's name
- **Output**: Created player object
- **Side Effects**: Broadcasts "player-joined" via Pusher
- **Usage**: Called when joining a room from homepage with join param

#### `assignRoles(roomId: string, assignments: { playerId: string; role: string }[])`
- **Purpose**: Assign roles to players and start the game
- **Input**: Room ID and array of player-role assignments
- **Output**: Updated room object
- **Side Effects**: Updates room status to "IN_PROGRESS", selects random scenario, broadcasts "game-started"
- **Usage**: Called by host to begin the simulation

#### `sendMessage(roomId: string, senderId: string, content: string)`
- **Purpose**: Send a message in the room and potentially trigger AI response
- **Input**: Room ID, sender ID, message content
- **Output**: Created message object
- **Side Effects**: Saves message, broadcasts via Pusher, may trigger AI response
- **Usage**: Called when a player sends a message in chat

#### `submitEvaluation(roomId: string, evaluatorId: string, targetId: string, scores: Record<number, number>)`
- **Purpose**: Submit evaluation scores for a player's performance
- **Input**: Room ID, evaluator ID, target ID, score records
- **Output**: Created evaluation object
- **Side Effects**: Saves evaluation to database
- **Usage**: Called when evaluator submits performance assessment

#### `revealEvaluations(roomId: string)`
- **Purpose**: Reveal all evaluations in the room
- **Input**: Room ID
- **Output**: None (void)
- **Side Effects**: Updates all evaluations to revealed, updates room status to "REVEALED", broadcasts "evaluations-revealed"
- **Usage**: Called by host to show all evaluations

#### `nextRound(roomId: string)`
- **Purpose**: Start a new round with a new scenario
- **Input**: Room ID
- **Output**: None (void)
- **Side Effects**: Clears messages and evaluations, selects new scenario, increments round counter, reshuffles roles, broadcasts "next-round"
- **Usage**: Called by host to start a new round

## Database Models (Prisma Schema)

### Room Model
```prisma
model Room {
  id           String       @id @default(uuid())
  status       String       @default("LOBBY") // LOBBY, IN_PROGRESS, REVEALED
  currentRound Int          @default(1)
  scenarioId   Int?
  players      Player[]     // Related players
  messages     Message[]    // Related messages  
  evaluations  Evaluation[] // Related evaluations
  createdAt    DateTime     @default(now())
}
```

### Player Model
```prisma
model Player {
  id             String       @id @default(uuid())
  roomId         String       // Reference to Room
  name           String       // Player's name
  role           String?      // SELLER, CLIENT, EVALUATOR
  isHost         Boolean      @default(false)
  room           Room         @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sentMessages   Message[]    // Messages sent by this player
  evaluations    Evaluation[] @relation("Evaluator") // Evaluations made by this player
  targetEvals    Evaluation[] @relation("Target")    // Evaluations received by this player
}
```

### Message Model
```prisma
model Message {
  id        String   @id @default(uuid())
  roomId    String   // Reference to Room
  senderId  String?  // Reference to Player (null if AI)
  content   String   // Message content
  isAi      Boolean  @default(false) // Is this an AI-generated message?
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  sender    Player?  @relation(fields: [senderId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

### Evaluation Model
```prisma
model Evaluation {
  id          String   @id @default(uuid())
  roomId      String   // Reference to Room
  evaluatorId String   // Reference to evaluating Player
  targetId    String   // Reference to evaluated Player
  scores      String   // JSON string of the 8 criteria scores
  revealed    Boolean  @default(false)
  room        Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  evaluator   Player   @relation("Evaluator", fields: [evaluatorId], references: [id], onDelete: Cascade)
  target      Player   @relation("Target", fields: [targetId], references: [id], onDelete: Cascade)
}
```

## Pusher Events

### Client Events (Broadcasted from Server)
- `player-joined`: A new player joined the room
  - Payload: Player object with id, name, role, isHost, roomId
  - Channel: `room-${roomId}`

- `game-started`: Game has started with role assignments
  - Payload: Room object with id, status, scenarioId, currentRound, players
  - Channel: `room-${roomId}`

- `new-message`: A new message was sent in the room
  - Payload: Message object with id, content, senderId, isAi, sender info
  - Channel: `room-${roomId}`

- `evaluations-revealed`: Evaluations have been revealed
  - Payload: None
  - Channel: `room-${roomId}`

- `next-round`: A new round has started
  - Payload: Updated room object with id, status, scenarioId, currentRound, players
  - Channel: `room-${roomId}`

### Server Events (Triggered from Client)
- Not directly used in this implementation; client interactions go through server actions

## Constants and Configuration

### JISR Evaluation Criteria (`JISR_EVALUATION_CRITERIA`)
1. "يفتح المحادثة بسؤال مفتوح" (Opens conversation with an open question)
2. "يكتشف 3 آلام في أقل من 15 دقيقة" (Discovers 3 pains in under 15 minutes)
3. "يعترف بالاعتراض قبل الرد" (Acknowledges objection before responding)
4. "يرد على الاعتراض بسؤال لا بجدال" (Responds to objection with a question, not argument)
5. "يخلق إلحاحاً طبيعياً" (Creates natural urgency)
6. "يغلق بخطوة تالية محددة بتاريخ" (Closes with specific next step and date)
7. "يرسل إيميل متابعة خلال ساعتين" (Sends follow-up email within 2 hours)
8. "يستخدم الـ reference / proof point بشكل صحيح" (Uses reference/proof point correctly)

### Buyer Personas (`BUYER_PERSONAS`)
1. **HR_MANAGER**: HR Manager focused on compliance, reducing manual work, employee experience
2. **CFO**: CFO focused on payroll accuracy, SAP integration, cost of errors
3. **OPS_MANAGER**: Operations Manager focused on shift control, overtime leakage, productivity

### Scenarios (`JISR_SCENARIOS`)
12 different sales scenarios with unique:
- Titles and persona associations
- Competitors (if applicable)
- Descriptions of the situation
- Hidden pains clients are experiencing
- Trigger questions that reveal the pain
- Initial objections clients raise

## Environment Variables
- `OPENAI_API_KEY`: API key for OpenAI integration
- Database URL: Connection string for SQLite database
- Pusher configuration: App ID, key, secret, cluster for real-time communication