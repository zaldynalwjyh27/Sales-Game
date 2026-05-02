# UI Components and User Flows

## User Interface Components

### Core UI Components (`src/components/ui/`)
These are reusable UI elements following the shadcn/ui design system principles:

#### Button (`button.tsx`)
- Custom styled button component
- Used throughout the application for all clickable actions
- Supports loading states and various styles

#### Card (`card.tsx`)
- Container for grouping related content
- Used for room displays, information panels, and forms
- Supports header, content, and footer sections

#### Input (`input.tsx`)
- Styled input field component
- Used for text entry throughout the application
- Consistent styling and accessibility attributes

#### Label (`label.tsx`)
- Accessory component for form labels
- Properly associated with input elements
- Ensures accessibility compliance

#### ScrollArea (`scroll-area.tsx`)
- Custom scrollbar implementation
- Used for scrollable content areas
- Provides consistent scrolling experience

#### Textarea (`textarea.tsx`)
- Styled multi-line text input
- Used for message composition and evaluation forms
- Responsive sizing and styling

### Application-Specific Components

#### ChatInterface (`src/components/ChatInterface.tsx`)
- Real-time messaging interface
- Displays message history with role-based styling
- Message composition area
- Auto-scrolls to latest messages
- Different styling for different roles (SELLER, CLIENT, EVALUATOR, AI)

#### RoleCardDisplay (`src/components/RoleCardDisplay.tsx`)
- Shows role-specific information
- For CLIENT role: displays persona details, tone, pain points
- For SELLER role: displays scenario details, objectives
- For EVALUATOR role: displays evaluation criteria
- Contextual information based on current scenario

#### HiddenEvaluatorForm (`src/components/HiddenEvaluatorForm.tsx`)
- Form for evaluators to assess seller performance
- Contains all 8 evaluation criteria with scoring
- Prevents duplicate submissions
- Submit button disabled after submission
- Visual feedback for submission status

#### ResultsRevealModal (`src/components/ResultsRevealModal.tsx`)
- Modal dialog showing evaluation results
- Aggregated scores from all evaluators
- Detailed breakdown of each criterion
- Visual indicators for strong/weak areas
- Host controls to advance to next round

## User Flows

### Flow 1: Creating a New Room
1. User visits homepage
2. Sees "Create Training Room" form with name input
3. Enters trainer/host name
4. Clicks "Create Room" button
5. Server action creates room and host player
6. Redirects to room page with player ID
7. User sees lobby view with room ID to share

### Flow 2: Joining a Room
1. User receives room link from host
2. Visits site with join parameter
3. Sees "Join Room" form with name input
4. Enters their name
5. Clicks "Join Room" button
6. Server action creates new player in room
7. Redirects to room page with assigned player ID
8. User joins lobby with other participants

### Flow 3: Starting a Game Session
1. Host is in lobby with 1+ other players
2. Host clicks "Start Training & Assign Roles" button
3. System assigns roles to all players:
   - One SELLER (first non-host player, or host if alone)
   - One CLIENT (second player, or AI if no second player)
   - Others become EVALUATORS
4. Random scenario is selected from available scenarios
5. All players see role assignments and scenario details
6. Game moves to IN_PROGRESS state

### Flow 4: Conducting the Sales Simulation
1. SELLER initiates conversation with CLIENT
2. Messages exchanged between SELLER and CLIENT
3. If CLIENT is AI (no human CLIENT in room):
   - SELLER messages trigger AI responses
   - AI responds according to persona, scenario, and hidden pain
   - AI only reveals hidden pain when prompted with trigger question
4. EVALUATORS observe the interaction
5. EVALUATORS evaluate SELLER against 8 criteria
6. Interaction continues until SELLER completes discovery or time expires

### Flow 5: Evaluation and Results
1. EVALUATORS complete HiddenEvaluatorForm during or after interaction
2. EVALUATORS submit their assessments
3. Once ready, HOST clicks "Reveal Results"
4. ResultsRevealModal appears showing aggregated scores
5. Participants review results and discuss
6. HOST can start next round with new scenario

### Flow 6: Next Round
1. HOST clicks "Next Round" option
2. System clears messages and evaluations from current round
3. Roles reshuffled for non-host players
4. New random scenario selected
5. Game returns to active state with new configuration
6. New SELLER begins interaction with CLIENT

## Responsive Design

### Desktop Layout (Large screens)
- Full three-column layout in active game
- Role display panel (left column)
- Evaluator form (left column, when applicable)
- Chat interface (right two columns)

### Tablet Layout (Medium screens)
- Two-column layout with role info above chat
- Stacked components when needed
- Maintained usability of all functions

### Mobile Layout (Small screens)
- Single-column layout
- Collapsible elements to maximize screen space
- Touch-optimized controls and targets
- Scrolling layouts for content overflow

## Internationalization and RTL Support

### Arabic Language Implementation
- All UI text in Arabic
- Right-to-left layout direction
- Arabic typography considerations
- Arabic-appropriate iconography and imagery

### Text Direction Controls
- Global RTL direction set in root layout
- Consistent spacing and alignment in RTL
- Proper positioning of icons and controls

## Accessibility Features

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order throughout interface
- Focus indicators for keyboard users

### Screen Reader Compatibility
- Semantic HTML structure
- Proper ARIA labels and descriptions
- Announcements for dynamic content changes

### Color and Contrast
- High contrast ratios for readability
- Color-blind friendly palettes
- Visual indicators beyond color alone