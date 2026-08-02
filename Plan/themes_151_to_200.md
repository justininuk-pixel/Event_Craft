# Category 4: Interactive Games & Puzzles (Themes 151 - 200)

### 151. The Claw Machine
* **Purpose:** A skill-based physics challenge.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A digital claw moves horizontally back and forth automatically. The user has one button: "Drop". They must time the drop perfectly so the physics-enabled claw grabs the specific prize capsule containing the message.
* **Interaction Model:** 1-button precision timing based on automated horizontal translation.
* **Structural Layout:** A 2D physics engine simulating a swinging claw on a track, dropping into a pit of rigid body spheres.
* **Editor Customization Options:**
  * *Content:* The prize message.
  * *Behavior:* Claw speed, grab strength (is it rigged to drop it sometimes?).
  * *Structure:* Visual of the prizes (teddy bears, colored spheres).
* **Superpower:** This theme is the only one that uses a 1D button press to trigger a vertical raycast drop to retrieve a physics object from a pile.

### 152. The Pinball Speller
* **Purpose:** Chaotic arcade interaction.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A mini pinball table. The user pulls a plunger to launch a ball. The ball bounces off bumpers. Some bumpers are letters. The user must keep the ball alive using flippers until it hits the specific letters required to spell the unlock password.
* **Interaction Model:** Drag-to-launch and dual-tap flipper control.
* **Structural Layout:** A vertical rigid-body physics board with bouncy colliders and two hinged flippers at the bottom.
* **Editor Customization Options:**
  * *Content:* The target word to spell, the final reward.
  * *Behavior:* Gravity/ball speed, number of balls allowed.
  * *Structure:* Table theme (retro neon, wooden classic).
* **Superpower:** This theme is the only one that uses chaotic pinball physics to randomly generate text input string matches.

### 153. The Mine Sweeper
* **Purpose:** A logic-based deduction puzzle.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A grid of tiles obscuring a photo. The user must use classic Minesweeper logic (numbers indicating adjacent bombs) to clear the safe tiles. If they click a bomb, the board resets. Clearing all safe tiles reveals the photo beneath.
* **Interaction Model:** Grid-based logic deduction (Tap to clear, Long-press to flag).
* **Structural Layout:** A mathematically generated grid array with adjacent-mine calculation logic covering a static background.
* **Editor Customization Options:**
  * *Content:* The photo revealed.
  * *Behavior:* Difficulty (grid size, number of bombs).
  * *Structure:* Visual style of the tiles (dirt, metal plates).
* **Superpower:** This theme is the only one that requires using numeric adjacency logic to safely map and clear a grid array without triggering a fail state.

### 154. The Five-Letter Guesser (Wordle Clone)
* **Purpose:** A vocabulary deduction lock.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user must guess a 5-letter word to unlock the card. After each guess, letters turn green (correct spot), yellow (wrong spot), or gray (not in word). They have 6 tries.
* **Interaction Model:** Keyboard input with immediate array-matching feedback.
* **Structural Layout:** A 6x5 grid of letter inputs with a virtual keyboard.
* **Editor Customization Options:**
  * *Content:* The 5-letter password, the unlocked message.
  * *Behavior:* Does the password change daily or is it static?
  * *Structure:* Color palette for the hints.
* **Superpower:** This theme is the only one that uses position-based character array matching to provide color-coded hints for text deduction.

### 155. The Flappy Obstacle
* **Purpose:** A frustrating, fast-twitch skill test.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user must tap the screen to keep a character in the air, navigating them through a series of narrow vertical pipes. They must successfully pass exactly 10 pipes to reach the "Finish Line" where the message is displayed. Hitting a pipe restarts the level.
* **Interaction Model:** Rhythmic single-tap vertical velocity boosting.
* **Structural Layout:** A side-scrolling physics environment with a constant negative Y-gravity and tap-triggered positive Y-impulse.
* **Editor Customization Options:**
  * *Content:* The finish line message.
  * *Behavior:* Gravity strength, gap size between pipes.
  * *Structure:* The flying character (bird, spaceship, ghost).
* **Superpower:** This theme is the only one that requires continuous rhythmic tapping to counteract gravity and navigate a horizontally scrolling obstacle course.

### 156. The Breakout Brick Smasher
* **Purpose:** A classic arcade clearing mechanic.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A photo is covered entirely by a wall of bricks. The user drags a paddle horizontally at the bottom of the screen to bounce a ball upwards, breaking the bricks one by one. Once all bricks are cleared, the photo is fully visible.
* **Interaction Model:** 1D horizontal dragging to deflect a 2D physics object.
* **Structural Layout:** A top layer of destructible grid blocks, a bouncing ball, and a draggable bottom paddle.
* **Editor Customization Options:**
  * *Content:* The background photo.
  * *Behavior:* Ball speed, paddle width.
  * *Structure:* Brick layout (heart shape, smiley face).
* **Superpower:** This theme is the only one that uses a user-controlled deflector paddle to systematically destroy a grid of obscuring blocks.

### 157. The Mastermind Codebreaker
* **Purpose:** Advanced logical deduction.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A combination lock where the user must guess the correct sequence of 4 colored pegs. After each guess, the game gives feedback: Black peg (right color, right spot), White peg (right color, wrong spot). They must use logic to deduce the exact sequence in 10 tries.
* **Interaction Model:** Multi-variable sequence guessing with abstract feedback.
* **Structural Layout:** A board with multiple rows for guesses and a side column for the black/white feedback pegs.
* **Editor Customization Options:**
  * *Content:* The locked message.
  * *Behavior:* Length of the code (4 to 6 pegs), duplicate colors allowed?
  * *Structure:* The available color palette.
* **Superpower:** This theme is the only one that uses abstract, position-agnostic boolean feedback to guide the deduction of a multi-variable color sequence.

### 158. The Personal Crossword
* **Purpose:** A trivia lock based on the sender and receiver's relationship.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A mini 4x4 or 5x5 crossword puzzle. The clues are highly personal (e.g., "Where we first met," "Your dog's name"). The user must type the correct answers into the intersecting grid to unlock the card.
* **Interaction Model:** Cell-based text input mapped to intersecting string arrays.
* **Structural Layout:** An interactive grid where selecting a cell highlights its corresponding Across and Down arrays and displays the relevant text clues.
* **Editor Customization Options:**
  * *Content:* The clues, the answers, the final reward.
  * *Behavior:* Auto-skip to next empty cell on typing.
  * *Structure:* Auto-generate the grid layout from the inputted words.
* **Superpower:** This theme is the only one that utilizes intersecting, two-dimensional string arrays mapped to specific trivia questions.

### 159. The Infinite Runner
* **Purpose:** A high-speed reaction test.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A character runs forward automatically. The user taps the screen to jump over obstacles (cacti, pits). The speed gradually increases. The user must survive for exactly 60 seconds to reach the "Castle" at the end containing the message.
* **Interaction Model:** Single-tap binary jump action on a forced-scroll timeline.
* **Structural Layout:** A 2D side-scrolling ground plane with randomly instantiated obstacle sprites.
* **Editor Customization Options:**
  * *Content:* The message in the castle.
  * *Behavior:* Game duration (30s to 120s), jump height.
  * *Structure:* The character/theme (dinosaur, ninja, car).
* **Superpower:** This theme is the only one that requires binary jump-evasion tactics against procedurally generated obstacles on a forced-scroll axis.

### 160. The Asteroid Defender
* **Purpose:** Frantic target acquisition and destruction.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The hidden message sits at the bottom of the screen. Asteroids fall from the top. The user must tap the asteroids to shoot and destroy them before they hit the message. If an asteroid hits the bottom, the message takes damage. Survive for 30 seconds to read it in peace.
* **Interaction Model:** 2D coordinate tapping to destroy descending targets.
* **Structural Layout:** A top-down 2D canvas with vertical projectile vectors and a bottom health-bar boundary.
* **Editor Customization Options:**
  * *Content:* The defended message.
  * *Behavior:* Spawn rate of asteroids, health of the message.
  * *Structure:* Theme (Spaceships vs Aliens, Snowballs vs Fort).
* **Superpower:** This theme is the only one focused on tapping randomly instantiated descending coordinate targets to prevent them from intersecting a Y-axis boundary.

### 161. The Cup Shuffle (Shell Game)
* **Purpose:** A test of visual tracking and concentration.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The screen shows three cups. A small ball (the message key) is placed under one. The cups then rapidly slide around and swap positions. When they stop, the user must tap the correct cup. If they are right, it opens. If wrong, they must try again.
* **Interaction Model:** Visual tracking of rapid DOM element translation.
* **Structural Layout:** 3 interactive sprites that execute a randomized array of CSS translation swaps.
* **Editor Customization Options:**
  * *Content:* The message key.
  * *Behavior:* Number of shuffles, speed of shuffles.
  * *Structure:* Visual of the containers (cups, hats, treasure chests).
* **Superpower:** This theme is the only one that relies entirely on the user's ability to visually track the X/Y coordinates of a specific element through a sequence of rapid randomized swaps.

### 162. The Golf Putt
* **Purpose:** A physics-based vector challenge.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A top-down view of a mini-golf hole. The user places their finger on the ball, drags backward to set the angle and power (showing an arrow), and releases to putt. They must get the ball into the hole in 3 strokes or less to view the card.
* **Interaction Model:** Drag-and-release to set a 2D velocity vector (slingshot mechanic).
* **Structural Layout:** A 2D physics arena with friction, bounce colliders, and a central drop-target (the hole).
* **Editor Customization Options:**
  * *Content:* The unlocked card.
  * *Behavior:* Friction of the green, number of strokes allowed.
  * *Structure:* Placement of obstacles (water hazards, walls).
* **Superpower:** This theme is the only one that uses a reverse drag-and-release slingshot gesture to define the angle and magnitude of a single physics impulse.

### 163. The Balancing Act
* **Purpose:** A delicate gyroscopic endurance test.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A tall pole is balanced on a finger on the screen. It naturally wants to tip left or right. The user must slightly tilt their physical phone left and right to keep the pole perfectly vertical for 15 straight seconds to unlock the card.
* **Interaction Model:** Gyroscopic inverse-kinematics balancing.
* **Structural Layout:** A rigid body physics object attached to a bottom hinge, reacting to device accelerometer data.
* **Editor Customization Options:**
  * *Content:* The reward content.
  * *Behavior:* Weight of the pole (difficulty), required duration.
  * *Structure:* Visual of the object (broomstick, stack of plates).
* **Superpower:** This theme is the only one that requires continuous micro-adjustments of physical device tilt to maintain the equilibrium of an unstable physics object.

### 164. The Whack-a-Mole
* **Purpose:** High-speed target discrimination.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A grid of 9 holes. Characters pop up randomly for 1 second and disappear. The user must tap the "Target" characters to gain points, but avoid tapping the "Decoy" characters which subtract points. Reach 20 points to win.
* **Interaction Model:** Rapid boolean discrimination and coordinate tapping.
* **Structural Layout:** A fixed grid of masked containers where sprites randomly translate along the Y-axis.
* **Editor Customization Options:**
  * *Content:* The prize.
  * *Behavior:* Spawn speed, target score.
  * *Structure:* Custom images for the Target and the Decoy (e.g., tap the sender's face, avoid the boss's face).
* **Superpower:** This theme is the only one that requires the user to continuously discriminate between "good" and "bad" targets appearing temporarily in fixed grid locations.

### 165. The Typing Invaders
* **Purpose:** A keyboard-based speed challenge.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Words fall from the top of the screen. To destroy a word before it hits the bottom, the user must type the exact word on their keyboard. Destroying 10 words unlocks the card.
* **Interaction Model:** Rapid, specific string matching via keyboard input.
* **Structural Layout:** Falling text DOM elements combined with a global `keydown` event listener that checks input against the active arrays.
* **Editor Customization Options:**
  * *Content:* The unlocked message.
  * *Behavior:* Fall speed, list of words used.
  * *Structure:* Theme (retro arcade, raining letters).
* **Superpower:** This theme is the only one that requires the user to type entire specific string sequences to destroy descending UI targets.

### 166. The Rigged Slot Machine
* **Purpose:** A gamified, illusion-of-chance reveal.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user pulls a virtual lever to spin three reels. The first two pulls are mathematically rigged to fail (e.g., showing Cherry-Cherry-Lemon), prompting a funny "Try again" message. The third pull is rigged to hit the Jackpot (7-7-7), which showers coins and opens the real message.
* **Interaction Model:** Drag-to-trigger with pre-determined sequential outcomes.
* **Structural Layout:** Three vertical scrolling arrays of images masked within a window, triggered by a 1D vertical lever UI.
* **Editor Customization Options:**
  * *Content:* The jackpot message, the fail messages.
  * *Behavior:* Number of pulls required to win.
  * *Structure:* Icons on the reels (emojis, custom photos).
* **Superpower:** This theme is the only one that disguises a linear progression sequence as a randomized casino game.

### 167. The Physics Drop (Line Rider)
* **Purpose:** A creative spatial reasoning puzzle.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A ball drops from the top left. A basket sits at the bottom right. The user must use their finger to draw rigid, physical lines on the screen to act as ramps and bridges to safely guide the falling ball into the basket.
* **Interaction Model:** Drawing 2D physics colliders.
* **Structural Layout:** A physics sandbox where the user's touch-path generates static rigid-body line segments.
* **Editor Customization Options:**
  * *Content:* The prize in the basket.
  * *Behavior:* Bounciness of the lines, limited ink supply?
  * *Structure:* Placement of the spawn point and basket.
* **Superpower:** This theme is the only one that allows the user to draw freehand paths that instantly become static collision boundaries in a physics engine.

### 168. The Snake Game
* **Purpose:** A classic grid-based routing challenge.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user controls a snake that constantly moves forward on a grid. Swiping changes direction. They must eat 10 apples (which makes the snake longer) without crashing into the walls or their own tail. Beating it reveals the card.
* **Interaction Model:** 4-way directional swiping to control a continuous vector.
* **Structural Layout:** A 2D grid array where the head updates position on a tick, and the tail array follows the head's previous coordinates.
* **Editor Customization Options:**
  * *Content:* The win screen message.
  * *Behavior:* Snake speed, number of apples required.
  * *Structure:* Grid size (tight vs open).
* **Superpower:** This theme is the only one that requires navigating a constantly moving object whose collision footprint grows larger with every successful action.

### 169. The Mini Sudoku
* **Purpose:** A pure mathematical logic lock.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The card is locked behind a 4x4 or 6x6 Sudoku grid. The user must fill in the missing numbers (1-4) ensuring no number repeats in a row, column, or block. Once the grid is mathematically valid, the vault opens.
* **Interaction Model:** Grid-based constrained integer input.
* **Structural Layout:** A CSS grid of inputs with real-time row/col/block validation logic.
* **Editor Customization Options:**
  * *Content:* The unlocked vault content.
  * *Behavior:* Difficulty (how many numbers are missing).
  * *Structure:* 4x4 (easy) vs 9x9 (hard).
* **Superpower:** This theme is the only one that uses multi-axis integer uniqueness validation (Sudoku logic) as the primary unlocking mechanism.

### 170. The 2D Escape Room
* **Purpose:** An exploratory point-and-click adventure.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A single static image of a messy room. The user must tap objects to interact with them (e.g., tap a pillow to move it, tap a drawer to open it, tap a key to collect it, tap the door to use the key). It's a micro-adventure to find the message.
* **Interaction Model:** Point-and-click state-based object interaction.
* **Structural Layout:** A background image overlaid with invisible hitboxes that toggle CSS visibility of other elements or update an inventory array.
* **Editor Customization Options:**
  * *Content:* The final message outside the door.
  * *Behavior:* Complexity of the puzzle (e.g., must find a code on a sticky note to open a safe to get the key).
  * *Structure:* The room aesthetic (office, bedroom, dungeon).
* **Superpower:** This theme is the only one that utilizes sequential hidden-object interactions and inventory state management within a single 2D scene.

### 171. The Fruit Slicer
* **Purpose:** Frantic, sweeping gestural input.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Objects (e.g., gifts, hearts) are tossed up from the bottom of the screen in an arc. The user must swipe their finger across the screen to "slice" them in half before they fall back down. Slicing 20 objects unlocks the card. If they slice a "Bomb", they lose points.
* **Interaction Model:** High-velocity line-intersection detection (swiping through targets).
* **Structural Layout:** 2D physics objects with parabolic trajectories, and a canvas overlay drawing the user's swipe trail.
* **Editor Customization Options:**
  * *Content:* The unlocked message.
  * *Behavior:* Toss frequency, penalty for missing.
  * *Structure:* Objects being sliced (envelopes, fruits, gems).
* **Superpower:** This theme is the only one that relies entirely on drawing high-speed line vectors that intersect with moving physics objects.

### 172. The Crane Stacker
* **Purpose:** A rhythm and precision building game.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A block moves left and right at the top of the screen. The user taps to drop it. The goal is to stack 5 blocks perfectly on top of each other. If a block overhangs, the overhanging part is sliced off, making the next block smaller and harder to hit.
* **Interaction Model:** 1-tap timing with cumulative diminishing margins of error.
* **Structural Layout:** Horizontally oscillating DOM elements that lock X-coordinates on tap, dynamically resizing based on the X-delta from the previous block.
* **Editor Customization Options:**
  * *Content:* The message at the top of the tower.
  * *Behavior:* Oscillation speed, number of blocks required.
  * *Structure:* Block visual (bricks, presents, cakes).
* **Superpower:** This theme is the only one where imprecise timing physically shrinks the hit-area for all subsequent interactions.

### 173. The Pac-Maze
* **Purpose:** Evasive pathfinding.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A top-down maze. The user swipes to move a character continuously down corridors. They must eat all 50 dots in the maze to reveal the message, while avoiding 2 enemy AI "ghosts" that roam the maze.
* **Interaction Model:** 4-way pathfinding with hostile AI evasion.
* **Structural Layout:** A tile-based grid system with A* pathfinding for enemy entities.
* **Editor Customization Options:**
  * *Content:* The win message.
  * *Behavior:* Ghost speed, maze complexity.
  * *Structure:* Visual theme (classic arcade, sneaking through a garden).
* **Superpower:** This theme is the only one that requires the user to clear a grid of items while simultaneously evading autonomous, path-finding hostile entities.

### 174. The Rock-Paper-Scissors AI
* **Purpose:** A psychological battle against a machine.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user must play Rock, Paper, Scissors against the app. The card only unlocks if the user wins a "Best 2 out of 3" match. The app uses a simple Markov chain to try and predict the user's next move based on their previous choices.
* **Interaction Model:** 3-choice tactical selection against an adaptive algorithm.
* **Structural Layout:** 3 prominent input buttons and a split-screen animation arena showing the clash.
* **Editor Customization Options:**
  * *Content:* The prize for winning.
  * *Behavior:* Win condition (Best of 3, Best of 5).
  * *Structure:* Hand visuals (hands, elemental magic).
* **Superpower:** This theme is the only one that pits the user in a turn-based tactical duel against an algorithm that learns from their input history.

### 175. The Drone Pilot
* **Purpose:** Complex dual-axis coordination.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The screen has two virtual joysticks (Left controls altitude/rotation, Right controls forward/strafe). The user must fly a virtual drone through a 2D or 3D room and land it gently on a specific "Landing Pad" to deliver the message.
* **Interaction Model:** Dual virtual-joystick continuous input.
* **Structural Layout:** Two multi-directional UI thumbsticks mapping values to a physics-enabled character controller.
* **Editor Customization Options:**
  * *Content:* The message on the landing pad.
  * *Behavior:* Flight physics (gravity, inertia, wind).
  * *Structure:* The environment being flown through.
* **Superpower:** This theme is the only one that requires simultaneous, continuous manipulation of two separate directional thumbsticks to control a physics object.

### 176. The Typing Racer
* **Purpose:** A high-speed transcription test.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A paragraph of text is shown. The user must type it out as fast as possible. A progress car moves across the screen based on their Words Per Minute (WPM). They must achieve a speed of >40 WPM without errors to outrun a pursuing "enemy" car and unlock the card.
* **Interaction Model:** High-frequency, accurate keyboard string matching.
* **Structural Layout:** A text block with live character-validation styling (green/red) tied to a timestamped WPM calculator.
* **Editor Customization Options:**
  * *Content:* The transcription paragraph, the final reward.
  * *Behavior:* Required WPM threshold.
  * *Structure:* Visual of the race (cars, runners, spaceships).
* **Superpower:** This theme is the only one that actively measures and requires a minimum keystroke-per-minute velocity from the user's physical keyboard.

### 177. The Tangram Puzzle
* **Purpose:** Spatial reasoning and geometry.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user is given 7 geometric shapes (triangles, squares, parallelograms) and a blank silhouette. They must drag and rotate the shapes to perfectly fill the silhouette without overlapping.
* **Interaction Model:** 2D drag, drop, and multi-tap rotation of polygons.
* **Structural Layout:** A canvas with draggable SVG polygons and a drop-target mask.
* **Editor Customization Options:**
  * *Content:* The revealed image/message.
  * *Behavior:* Snap-to-grid tolerance, auto-rotation on near-fit.
  * *Structure:* The silhouette shape (cat, boat, heart).
* **Superpower:** This theme is the only one that requires the user to rotate and pack irregularly shaped polygons into a specific contiguous 2D boundary.

### 178. The Rhythm Hero
* **Purpose:** Musical timing and lane coordination.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Four vertical lanes. Notes fall from the top of the screen in time with a song. The user must tap the 4 buttons at the bottom exactly when the notes cross the strike line. They must achieve 80% accuracy to finish the song and open the card.
* **Interaction Model:** Multi-lane rhythmic tapping synced to audio.
* **Structural Layout:** A forced-scroll timeline mapped to audio playback, evaluating hit-box overlaps on user tap events.
* **Editor Customization Options:**
  * *Content:* The audio track, the final message.
  * *Behavior:* Scroll speed, required accuracy percentage.
  * *Structure:* Number of lanes (3 to 5).
* **Superpower:** This theme is the only one that streams multiple dynamic targets simultaneously down fixed lanes requiring audio-synced interception.

### 179. The Hidden Object Hunt
* **Purpose:** Extreme visual scanning and panning.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A massive, incredibly dense and crowded illustration (like Where's Waldo). The user must pinch-to-zoom and pan around the image to find 3 specific tiny items (e.g., a red key, a blue bird). Tapping all 3 unlocks the vault.
* **Interaction Model:** 2D panning, zooming, and precision coordinate tapping.
* **Structural Layout:** An oversized background image within a hidden-overflow container, overlaid with 3 specific transparent hitboxes.
* **Editor Customization Options:**
  * *Content:* The master image, the 3 items to find.
  * *Behavior:* Zoom limits (max 5x zoom).
  * *Structure:* Clues provided (images of the items vs text descriptions).
* **Superpower:** This theme is the only one focused entirely on zooming and panning a single massive image to locate microscopic tap targets.

### 180. The Laser Reflector
* **Purpose:** Angular logic and pathing.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A grid with a laser emitter and a receiver. The user is given 3 mirrors. They must drag and rotate the mirrors on the grid to bounce the continuous laser beam around obstacles and hit the receiver.
* **Interaction Model:** Placement and rotation of 2D directional deflectors.
* **Structural Layout:** A grid calculating continuous line-segment intersections and reflection angles in real-time.
* **Editor Customization Options:**
  * *Content:* The message powered by the receiver.
  * *Behavior:* Number of mirrors, placement of static obstacles.
  * *Structure:* Visual style (sci-fi lasers, sunlight and mirrors).
* **Superpower:** This theme is the only one that uses continuous, real-time geometric ray-tracing that updates instantly based on user-placed deflectors.

### 181. The Plinko Drop
* **Purpose:** A game of chance and minor positioning.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A pegboard. At the bottom are 5 slots, only one says "Unlock". The user slides a ball horizontally at the top of the screen and drops it. It bounces chaotically down the pegs. If it misses the Unlock slot, they must try again from a different starting position.
* **Interaction Model:** 1D horizontal positioning followed by a physics simulation.
* **Structural Layout:** A 2D physics board filled with static circular colliders (pegs) and dynamic spheres.
* **Editor Customization Options:**
  * *Content:* The unlocked message, the fail messages in other slots.
  * *Behavior:* Peg density, ball bounciness.
  * *Structure:* Board theme (game show, pachinko).
* **Superpower:** This theme is the only one where the user only dictates the starting X-coordinate of an object, relying entirely on a chaotic physics simulation for the outcome.

### 182. The Rotary Dial
* **Purpose:** Nostalgic, tactile data entry.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A vintage rotary telephone dial. The user cannot just tap numbers; they must place their finger in a number's hole, drag it clockwise to the stopper, and release it to let it spin back. They must dial a specific 7-digit number to "connect the call" to the message.
* **Interaction Model:** Rotational drag with a required maximum-arc release point.
* **Structural Layout:** A circular UI element requiring rotational drag math and spring-animation return physics.
* **Editor Customization Options:**
  * *Content:* The connected audio or text message.
  * *Behavior:* The 7-digit target number, dial spring speed.
  * *Structure:* Phone color/style.
* **Superpower:** This theme is the only one that forces the user to input numbers by dragging a radial element to a fixed physical stopper point and releasing.

### 183. The Word Snake (Boggle)
* **Purpose:** Multi-directional string building.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A 4x4 grid of random letters. The user must trace a continuous path connecting adjacent letters (horizontally, vertically, or diagonally) to spell a specific hidden word. The line connects as they drag their finger.
* **Interaction Model:** Continuous, multi-directional adjacent-node tracing.
* **Structural Layout:** A letter grid that draws an SVG polyline following the user's touch path, validating against a dictionary array.
* **Editor Customization Options:**
  * *Content:* The target word, the unlocked content.
  * *Behavior:* Allowed to reuse letters? (No).
  * *Structure:* Grid size (3x3 to 5x5).
* **Superpower:** This theme is the only one that requires tracing an unbroken path through adjacent grid nodes to compile a text string.

### 184. The 15-Puzzle Slider
* **Purpose:** Classic tile manipulation.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A photo is cut into a 4x4 grid. 15 pieces are scrambled, and 1 space is empty. The user must tap tiles adjacent to the empty space to slide them over, painstakingly reordering the tiles to recreate the image.
* **Interaction Model:** Grid-constrained orthogonal swapping.
* **Structural Layout:** A CSS grid where elements can only swap X/Y coordinates with a single `null` index.
* **Editor Customization Options:**
  * *Content:* The target photo.
  * *Behavior:* Scramble complexity, toggle a "show numbers" hint.
  * *Structure:* 3x3 (Easy) vs 4x4 (Hard).
* **Superpower:** This theme is the only one that relies on shifting tiles into a single vacant grid slot to solve a 2D array sort.

### 185. The Basket Catcher
* **Purpose:** 1D gyroscopic evasion and collection.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Objects fall from the sky. The user tilts their phone left and right to move a basket at the bottom of the screen. They must catch 20 "good" items (stars) and avoid catching any "bad" items (bombs).
* **Interaction Model:** Gyroscope-driven 1D horizontal translation.
* **Structural Layout:** Falling physics objects with collision detection against a bottom-anchored, tilt-controlled kinematic body.
* **Editor Customization Options:**
  * *Content:* The win message.
  * *Behavior:* Falling speed, ratio of good to bad items.
  * *Structure:* Basket and item visuals (catching apples, catching raindrops).
* **Superpower:** This theme is the only one that uses device tilt strictly to translate an object along a 1D horizontal track to intercept falling targets.

### 186. The Directional Simon
* **Purpose:** Complex gesture memorization.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Instead of colored buttons, the screen shows a central arrow that flashes a sequence of directions (Up, Left, Up, Down). The user must then perform that exact sequence of *swipes* on the screen.
* **Interaction Model:** Sequential multi-directional swipe input.
* **Structural Layout:** A gesture-recognition layer mapping directional deltas to an expected array sequence.
* **Editor Customization Options:**
  * *Content:* The unlocked message.
  * *Behavior:* Sequence length (4 to 8 directions).
  * *Structure:* Visual cues (arrows, character looking around).
* **Superpower:** This theme is the only one that requires memorizing and regurgitating a sequence of distinct directional swipe gestures rather than simple taps.

### 187. The Audio Pitch Matcher
* **Purpose:** A test of musical ear.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The card plays a continuous tone (e.g., a C note). The user has a vertical slider that controls the pitch of a second oscillator. They must slide it up and down until their pitch perfectly matches the target tone for 3 seconds.
* **Interaction Model:** 1D slider mapping to Web Audio API frequency.
* **Structural Layout:** Two audio nodes, one static, one variable, with a logic loop comparing their Hertz values.
* **Editor Customization Options:**
  * *Content:* The unlocked card.
  * *Behavior:* Margin of error (+/- 5 Hz).
  * *Structure:* The sound waveform (sine, square, sawtooth).
* **Superpower:** This theme is the only one that requires the user to manually tune a live audio oscillator to perfectly match a target frequency.

### 188. The Water Pipe Plumber
* **Purpose:** Rotational pathfinding.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A grid of scrambled pipe segments (straight, L-shapes, T-shapes). A water source is at the top, a drain at the bottom. The user must tap individual pipe segments to rotate them 90 degrees until they form a continuous, leak-free path.
* **Interaction Model:** Grid-based object rotation to complete a continuous graph.
* **Structural Layout:** A matrix of objects where tapping increments a CSS `rotate` value, evaluated by a pathfinding algorithm checking for adjacent connected nodes.
* **Editor Customization Options:**
  * *Content:* The message shown when the water flows.
  * *Behavior:* Grid size (5x5 to 8x8).
  * *Structure:* Visual style (metal pipes, neon circuits).
* **Superpower:** This theme is the only one that requires rotating fixed grid elements to construct an unbroken path from point A to point B.

### 189. The Mini Tower Defense
* **Purpose:** Resource management and spatial strategy.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A winding path leads to the hidden message. Small "bugs" walk down the path. The user is given 3 "Turrets". They must drag and drop the turrets onto strategic spots around the path. The turrets auto-shoot the bugs. Stop 10 bugs to win.
* **Interaction Model:** Limited drag-and-drop placement of autonomous defensive units.
* **Structural Layout:** A pathfinding enemy spawner and user-placed static objects with radius-based trigger zones.
* **Editor Customization Options:**
  * *Content:* The defended message.
  * *Behavior:* Bug health, turret range.
  * *Structure:* Theme (Plants vs Zombies style, sci-fi).
* **Superpower:** This theme is the only one where the user's only interaction is placing autonomous agents on a grid to defeat moving targets for them.

### 190. The Balloon Dart Throw
* **Purpose:** Timing and projectile trajectory.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Balloons drift slowly across a wall from left to right. The user taps the bottom of the screen to throw a dart straight up. They must time the tap perfectly so the dart's flight time intersects with the moving balloon. Pop 5 balloons to see the message behind the wall.
* **Interaction Model:** 1-tap timing to launch a vertical projectile at horizontal moving targets.
* **Structural Layout:** Horizontally translating targets and vertically translating projectiles with overlap detection.
* **Editor Customization Options:**
  * *Content:* The message behind the balloons.
  * *Behavior:* Dart travel speed, balloon movement speed.
  * *Structure:* Visuals (carnival game, ninja stars).
* **Superpower:** This theme is the only one that requires calculating lead-time by firing a vertical projectile at a horizontally moving target.

### 191. The Seesaw Balance (Weights)
* **Purpose:** Mathematical addition/equilibrium puzzle.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A seesaw is tipped entirely to the left due to a massive heavy block (e.g., "100 lbs"). The user is given a bin of smaller blocks (10s, 25s, 50s). They must drag the correct combination of blocks onto the right side to perfectly balance the scale (equal 100).
* **Interaction Model:** Drag-and-drop integer addition.
* **Structural Layout:** A physics scale that evaluates the sum of the data-values of objects placed in specific drop zones.
* **Editor Customization Options:**
  * *Content:* The message shown when balanced.
  * *Behavior:* The target weight, the available block sizes.
  * *Structure:* The visual theme (gold bars, weights, animals).
* **Superpower:** This theme is the only one that visually represents an integer addition puzzle using a pivoting balance scale.

### 192. The Spot the Odd One Out
* **Purpose:** High-speed visual discrimination.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The screen flashes 4 nearly identical images (e.g., 4 smiling faces, but one is missing an eyebrow). The user has 5 seconds to tap the "odd one out." They must survive 5 rounds of increasingly subtle differences to unlock the card.
* **Interaction Model:** High-pressure multiple choice visual selection.
* **Structural Layout:** A 2x2 grid of images with a rapidly depleting timer bar.
* **Editor Customization Options:**
  * *Content:* The final reward.
  * *Behavior:* Time per round (3s to 10s).
  * *Structure:* The image sets used (can be uploaded by creator).
* **Superpower:** This theme is the only one that requires extremely rapid visual comparison of 4 concurrent images to identify a single anomaly.

### 193. The Drone Bomber
* **Purpose:** Velocity and lead-time calculation.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** The user views the screen top-down as a drone flying constantly forward (vertical scrolling ground). A target (a landing pad) appears below. The user must tap exactly once to drop a package. Because of forward momentum, they must drop it *before* they are directly over the target.
* **Interaction Model:** 1-tap timing with inherited momentum physics.
* **Structural Layout:** A vertically scrolling background. Tapping instantiates an object that inherits the camera's Y-velocity and scales down (simulating falling) until it hits the ground plane.
* **Editor Customization Options:**
  * *Content:* The message inside the delivered package.
  * *Behavior:* Flight speed (difficulty).
  * *Structure:* Theme (delivering a gift, dropping a water balloon).
* **Superpower:** This theme is the only one that forces the user to calculate inherited forward momentum when dropping an object onto a scrolling map.

### 194. The Caesar Cypher Ring
* **Purpose:** Cryptographic codebreaking.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A message is displayed as gibberish (e.g., "KHOOR"). Below is a 3D or 2D decoder ring with an inner and outer alphabet. The user must rotate the inner ring to shift the alphabet by a certain number of letters (e.g., Shift 3) until the text above live-translates into English.
* **Interaction Model:** Rotational dragging driving real-time string replacement.
* **Structural Layout:** Two concentric circular arrays where rotation offsets the index mapping between them, applying a Caesar cipher to a text block.
* **Editor Customization Options:**
  * *Content:* The encrypted message.
  * *Behavior:* The shift key (1 to 25).
  * *Structure:* Ring design (steampunk, minimalist).
* **Superpower:** This theme is the only one that uses a rotatable UI dial to apply a real-time cryptographic alphabetical shift to a block of text.

### 195. The Constellation Memory Draw
* **Purpose:** Short-term spatial memory.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A group of 5 stars appears. Lines automatically draw between them in a specific shape, then immediately fade away. The user must then use their finger to redraw the exact same lines connecting the exact same stars in any order.
* **Interaction Model:** Observation followed by 2D path recreation.
* **Structural Layout:** A node graph that briefly shows an edge array, hides it, and requires the user to recreate that specific edge array.
* **Editor Customization Options:**
  * *Content:* The unlocked message.
  * *Behavior:* Complexity (3 stars vs 8 stars).
  * *Structure:* Visuals (space, chalk on a board).
* **Superpower:** This theme is the only one that requires the user to memorize and physically redraw a specific graph of connecting lines between fixed nodes.

### 196. The Jump Rope Sync
* **Purpose:** Rhythmic anticipation.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** Two characters are swinging a jump rope in a 3D arc. The user controls a character in the middle. They must tap the screen to jump. The jump has a fixed air-time. They must tap slightly *before* the rope hits their feet, syncing their jump arc with the rope arc 5 times in a row.
* **Interaction Model:** Phase-matching timing.
* **Structural Layout:** Two overlapping animations (the rope swing and the character jump) that must maintain specific phase alignment to avoid triggering a fail collision.
* **Editor Customization Options:**
  * *Content:* The message revealed upon success.
  * *Behavior:* Rope speed.
  * *Structure:* Characters (kids, animals, robots).
* **Superpower:** This theme is the only one that requires initiating an action prematurely so its apex aligns perfectly with the nadir of an autonomous swinging object.

### 197. The Traffic Jam (Rush Hour)
* **Purpose:** Complex spatial sliding puzzle.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A 6x6 grid filled with 1x2 and 1x3 rectangles (cars). The user must slide the blocking cars horizontally or vertically (they can only move along their long axis) to clear a path for the "Red Car" (the message) to exit the grid.
* **Interaction Model:** Axis-constrained 2D dragging.
* **Structural Layout:** A grid bounding-box with objects that only accept either X-axis or Y-axis touch translation based on their orientation.
* **Editor Customization Options:**
  * *Content:* The message on the red car.
  * *Behavior:* Puzzle layout (difficulty).
  * *Structure:* Visuals (cars, wooden blocks).
* **Superpower:** This theme is the only one that requires moving multiple blocking elements along strictly locked 1D axes to clear a path for a primary object.

### 198. The Target Reticle (Gyro Hold)
* **Purpose:** Steady-hand physical control.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A small target moves erratically around the screen. The user has a crosshair locked to the center of their screen. They must tilt their physical phone to pan the camera, keeping the crosshair perfectly hovered over the erratic target for 5 continuous seconds.
* **Interaction Model:** Gyroscopic tracking of an autonomous AI target.
* **Structural Layout:** A fixed central UI element, with the background and AI target translating inversely to the device's accelerometer input.
* **Editor Customization Options:**
  * *Content:* The locked message.
  * *Behavior:* Target speed and erraticness, required hold time.
  * *Structure:* Theme (sniper scope, camera lens, spaceship HUD).
* **Superpower:** This theme is the only one that requires continuously tilting the device to track an erratically moving object with a fixed central reticle.

### 199. The Color Sorter (Tubes)
* **Purpose:** Logical sequencing and temporary storage.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** 4 glass tubes. 3 are filled with mixed colored balls (Red, Blue, Green), 1 is empty. The user taps a tube to pop the top ball up, then taps another tube to drop it in. They can only drop a ball onto an empty space or a ball of the same color. Sort all colors into their own tubes to win.
* **Interaction Model:** LIFO (Last-In-First-Out) stack manipulation.
* **Structural Layout:** 4 array stacks acting as rigid tubes.
* **Editor Customization Options:**
  * *Content:* The reward message.
  * *Behavior:* Complexity (number of tubes/colors).
  * *Structure:* Visuals (potions, candy).
* **Superpower:** This theme is the only one that forces the user to sort arrays using strict Last-In-First-Out (LIFO) stack logic.

### 200. The Tumbler Audio Click
* **Purpose:** An audio-only precision puzzle.
* **Category:** Interactive Games & Puzzles
* **Unique Functionality:** A giant combination lock dial. The user drags it in a circle. It makes a generic "tick" sound for every number. However, exactly one number makes a distinct, slightly higher-pitched "click" (or vibration). The user must rely entirely on audio/haptics to find the 3 correct numbers.
* **Interaction Model:** Blind rotational dragging guided solely by audio/haptic feedback.
* **Structural Layout:** A rotary dial UI where the `onRotate` event fires distinct Web Audio API nodes or Haptic vibration patterns based on the current angle.
* **Editor Customization Options:**
  * *Content:* The vault contents.
  * *Behavior:* The combination numbers.
  * *Structure:* Safe visual design.
* **Superpower:** This theme is the only one that hides the success criteria completely from the visual UI, requiring the user to rely entirely on subtle audio or haptic cues.
