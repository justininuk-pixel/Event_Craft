# Category 2: Social & Collaborative (Themes 51 - 100)

### 51. The Collaborative Mosaic
* **Purpose:** A group card where each invitee contributes one "tile" to reveal a larger hidden picture.
* **Category:** Social & Collaborative
* **Unique Functionality:** A grid-based multiplayer canvas. The underlying image is only revealed once a specific number of people have uploaded their individual micro-photos or messages.
* **Interaction Model:** Multi-user asynchronous input (upload image/text) -> Global grid update.
* **Structural Layout:** A dynamic grid that expands based on the number of invitees. Tapping a filled tile flips it to show the contributor's message.
* **Editor Customization Options:**
  * *Content:* The master background image, prompt for contributors.
  * *Behavior:* Number of required tiles to complete, whether contributors can see others' tiles before finishing.
  * *Structure:* Grid dimensions (e.g., 3x3, 5x5).
* **Superpower:** This theme is the only one that crowdsources its own unlocking mechanism from multiple different users asynchronously.

### 52. The Tug of War
* **Purpose:** A live, head-to-head decision maker.
* **Category:** Social & Collaborative
* **Unique Functionality:** Two opposing options (e.g., "Pizza" vs "Burgers"). Any user viewing the card can repeatedly tap their preferred side. The central "rope" moves in real-time based on the global tap volume.
* **Interaction Model:** Real-time multiplayer button mashing.
* **Structural Layout:** A horizontally split screen with a central indicator (the flag on the rope) that translates left or right.
* **Editor Customization Options:**
  * *Content:* The two opposing choices.
  * *Behavior:* Duration of the match (e.g., 60 seconds), tap weight multiplier.
  * *Structure:* Visual representation (rope, scales, progress bars).
* **Superpower:** This theme is the only one that uses real-time, global click-frequency aggregation to move a 1D physics object.

### 53. The Digital Guestbook (Infinite Canvas)
* **Purpose:** Unstructured, free-form group signing.
* **Category:** Social & Collaborative
* **Unique Functionality:** An infinitely panning 2D canvas. Anyone with the link can pan around and place a text signature, sticker, or doodle anywhere on the board.
* **Interaction Model:** Unbound 2D panning and absolute-positioned object placement.
* **Structural Layout:** A boundless HTML canvas with no fixed grid, only relative coordinates for placed elements.
* **Editor Customization Options:**
  * *Content:* The background texture (corkboard, whiteboard, parchment).
  * *Behavior:* Can users delete others' signatures? (True/False).
  * *Structure:* Allowed input types (Text only, Stickers only, Doodles).
* **Superpower:** This theme is the only one that offers an unconstrained, infinite coordinate space for multiplayer object placement.

### 54. The Live Word Cloud
* **Purpose:** Gauging group sentiment instantly.
* **Category:** Social & Collaborative
* **Unique Functionality:** Users are prompted with a question and can submit a single word. The card dynamically generates a word cloud where the size of each word correlates to the frequency of its submission across all users.
* **Interaction Model:** Single-string text input with global aggregation.
* **Structural Layout:** A text input field at the bottom, and a physics-based typography layout engine taking up the rest of the screen.
* **Editor Customization Options:**
  * *Content:* The prompt question.
  * *Behavior:* Profanity filter, max character limit per submission.
  * *Structure:* Word cloud shape (circle, star, heart).
* **Superpower:** This theme is the only one that algorithmically scales typography based on live multiplayer text-string matching.

### 55. The Blind Voting Booth
* **Purpose:** Unbiased group polling.
* **Category:** Social & Collaborative
* **Unique Functionality:** A poll where the current results are completely hidden from all users. Only the creator has a "Reveal Results" button. Once pressed, the screen updates for everyone simultaneously to show the winner.
* **Interaction Model:** Asynchronous hidden polling with a synchronized master reveal.
* **Structural Layout:** A list of voting options that transitions into a bar chart only upon a remote websocket trigger.
* **Editor Customization Options:**
  * *Content:* The question and the options.
  * *Behavior:* Can users change their vote before the reveal?
  * *Structure:* Result visualization style (pie chart vs bar graph).
* **Superpower:** This theme is the only one that features an asymmetrical permission model where a single creator's tap alters the visual state on all other viewers' devices simultaneously.

### 56. The Jukebox Queue
* **Purpose:** Democratic control of media playback.
* **Category:** Social & Collaborative
* **Unique Functionality:** A shared media player. Users can paste links (YouTube/Spotify) to add them to a global queue. Crucially, users can upvote/downvote tracks in the queue, reordering the playlist in real-time.
* **Interaction Model:** Collaborative list appending and priority sorting via voting.
* **Structural Layout:** A pinned media player at the top, followed by a dynamic list view sorted by an integer value (score).
* **Editor Customization Options:**
  * *Content:* The initial seed track.
  * *Behavior:* Can a user vote multiple times? Does a track disappear after playing?
  * *Structure:* Allowed media sources.
* **Superpower:** This theme is the only one that continuously re-sorts a live media playlist based on real-time multiplayer voting logic.

### 57. The Exquisite Corpse
* **Purpose:** A bizarre, disjointed collaborative artwork.
* **Category:** Social & Collaborative
* **Unique Functionality:** User 1 draws the "head" and folds it over, leaving only the neck visible. User 2 draws the "body" connecting to the neck, having no idea what the head looks like. User 3 draws the "legs." The final image is then revealed to all three.
* **Interaction Model:** Sequential, blinded drawing.
* **Structural Layout:** A drawing canvas strictly locked to 1/3rd of the vertical height per user, passing state to the next user upon completion.
* **Editor Customization Options:**
  * *Content:* The drawing prompt.
  * *Behavior:* Time limit per section.
  * *Structure:* Number of sections (3, 4, or 5).
* **Superpower:** This theme is the only one that enforces sequential user input while intentionally hiding the previous user's full input.

### 58. The Passed Note
* **Purpose:** A collaborative storytelling chain.
* **Category:** Social & Collaborative
* **Unique Functionality:** User 1 writes a sentence to start a story. They send the link to User 2. User 2 only sees User 1's sentence, adds their own, and sends to User 3. Only the final designated recipient (or the creator) gets to read the entire combined story.
* **Interaction Model:** Peer-to-peer sequential text appending.
* **Structural Layout:** A single text input field showing only the `n-1` index of an array of strings.
* **Editor Customization Options:**
  * *Content:* The starting sentence.
  * *Behavior:* Maximum number of participants.
  * *Structure:* Sentence length limit.
* **Superpower:** This theme is the only one that passes an ever-growing string payload sequentially from user to user like a baton.

### 59. The Group Fundraiser (Thermometer)
* **Purpose:** Visualizing collective progress toward a goal.
* **Category:** Social & Collaborative
* **Unique Functionality:** A massive visual thermometer. As users tap a "contribute" button (representing money, effort, or just support), the "mercury" rises in real-time for everyone viewing. Reaching the top triggers a global celebration animation.
* **Interaction Model:** Global cumulative integer tracking.
* **Structural Layout:** A large vertical progress bar (styled creatively) taking up the center, with a call-to-action button below.
* **Editor Customization Options:**
  * *Content:* The goal name.
  * *Behavior:* The maximum goal integer, whether to show individual contributors' names.
  * *Structure:* The visual metaphor (thermometer, battery charging, rocket fueling).
* **Superpower:** This theme is the only one focused purely on filling a single, global 1D progress bar through the cumulative actions of all visitors.

### 60. The Emoji Heatmap
* **Purpose:** Silent, location-based group reactions.
* **Category:** Social & Collaborative
* **Unique Functionality:** A large background image (e.g., a new apartment layout, a group photo). Users select an emoji from a palette and tap anywhere on the image to drop it. Over time, clusters form, creating a visual heatmap of group opinions on specific parts of the image.
* **Interaction Model:** Coordinate-specific emoji stamping.
* **Structural Layout:** A static image container that listens for X/Y tap coordinates and appends absolute-positioned emoji spans globally.
* **Editor Customization Options:**
  * *Content:* The base image.
  * *Behavior:* Max emojis per user.
  * *Structure:* Available emoji palette.
* **Superpower:** This theme is the only one that aggregates multiplayer reactions based on specific X/Y coordinates overlaid on a static image.

### 61. The Multi-Key Launch (Nuclear Submarine)
* **Purpose:** Enforcing synchronized group presence.
* **Category:** Social & Collaborative
* **Unique Functionality:** The content is locked behind 3 keyholes. The card must be opened on 3 different devices simultaneously. Each user must press and hold their finger on their screen at the exact same time. Only when 3 active websocket connections register a "hold" state does the card open for all of them.
* **Interaction Model:** Synchronous multi-device presence detection.
* **Structural Layout:** A dashboard showing the connection/hold status of the required number of participants.
* **Editor Customization Options:**
  * *Content:* The highly guarded secret content.
  * *Behavior:* Number of simultaneous users required (2 to 5).
  * *Structure:* The visual metaphor (turning keys, pressing buttons, scanning hands).
* **Superpower:** This theme is the only one that requires simultaneous real-time interaction across entirely different physical devices to unlock.

### 62. The Soundboard Jam
* **Purpose:** Spontaneous musical collaboration.
* **Category:** Social & Collaborative
* **Unique Functionality:** Everyone who opens the link sees a 4x4 grid of buttons (a drum machine). Tapping a button plays a sound locally, but also instantly triggers that same sound and visual flash on the screens of everyone else currently viewing the link.
* **Interaction Model:** Real-time peer-to-peer audio triggering.
* **Structural Layout:** A 4x4 grid of colored SVG squares.
* **Editor Customization Options:**
  * *Content:* The sound kit (Drums, Synth, Animal noises).
  * *Behavior:* Quantization (snapping sounds to a grid vs raw timing).
  * *Structure:* Number of pads (2x2 vs 4x4).
* **Superpower:** This theme is the only one that turns the viewers' devices into a synchronized, distributed musical instrument.

### 63. The Debate Scales
* **Purpose:** Weighing public opinion physically.
* **Category:** Social & Collaborative
* **Unique Functionality:** A question with two answers. Users must drag their personal avatar (or a generic weight) and drop it onto the left or right side of a physical balance scale on screen. The scale tilts dynamically based on the total weight of avatars on each side.
* **Interaction Model:** Drag-and-drop to influence a global physics constraint.
* **Structural Layout:** A physics-enabled balance scale pivoting on a central fulcrum.
* **Editor Customization Options:**
  * *Content:* The debate topic and the two sides.
  * *Behavior:* Can users change sides after dropping?
  * *Structure:* Visual of the weights (avatars, sandbags, gold coins).
* **Superpower:** This theme is the only one that visualizes a poll by simulating rotational physics (torque) based on global user choices.

### 64. The Hat Draw (Secret Santa)
* **Purpose:** Automated, unbiased allocation.
* **Category:** Social & Collaborative
* **Unique Functionality:** Users arrive and type their name onto a slip of paper, dropping it into a virtual hat. Once the creator hits "Draw," the system randomly assigns every user one name from the hat (ensuring no one gets themselves), and privately displays that name only to them.
* **Interaction Model:** Centralized array shuffling and private distribution.
* **Structural Layout:** A two-phase layout: an input phase (putting names in) and a private reveal phase (seeing who you got).
* **Editor Customization Options:**
  * *Content:* Event title/rules.
  * *Behavior:* Toggle allowing users to see the full list of participants before the draw.
  * *Structure:* Visual theme (Santa hat, Magic cauldron, Lottery tumbler).
* **Superpower:** This theme is the only one that takes an array of user inputs, secretly shuffles them, and distributes exactly one unique result back to each user.

### 65. The Live Auction
* **Purpose:** Inducing panic and competition.
* **Category:** Social & Collaborative
* **Unique Functionality:** A single item is displayed with a price. A 60-second timer counts down. Any user tapping "Bid" increases the price by $1 and resets the timer to 10 seconds. The card ends when the timer hits 0, permanently displaying the winner.
* **Interaction Model:** Competitive time-resetting button presses.
* **Structural Layout:** Large timer, current high bid, and a massive "Bid" button.
* **Editor Customization Options:**
  * *Content:* The item being auctioned (real or joke).
  * *Behavior:* Starting bid, bid increment amount, reset timer duration.
  * *Structure:* Auctioneer aesthetic.
* **Superpower:** This theme is the only one that uses a global countdown timer that can be repeatedly extended by competitive user inputs.

### 66. The Crowd-Sourced Map
* **Purpose:** Visualizing geographic distribution.
* **Category:** Social & Collaborative
* **Unique Functionality:** A world map. Users who open the link are prompted to drop a pin representing their current location or hometown. The map populates in real-time, showing a constellation of where everyone is located.
* **Interaction Model:** Global coordinate placement on a geographic projection.
* **Structural Layout:** A Mapbox/Leaflet wrapper taking up the full screen, with clustered map markers.
* **Editor Customization Options:**
  * *Content:* Map title.
  * *Behavior:* Auto-locate via GPS vs manual pin dropping.
  * *Structure:* Map style (satellite, retro, dark mode).
* **Superpower:** This theme is the only one dedicated to placing multiplayer data points onto a real-world geographic map projection.

### 67. The Shared Bingo Board
* **Purpose:** Gamifying a shared viewing experience (e.g., watching a movie or a Zoom call).
* **Category:** Social & Collaborative
* **Unique Functionality:** The creator defines 24 events. Every user gets a randomly shuffled 5x5 bingo card of those events. When a user gets 5 in a row, they hit "BINGO!", triggering a global alert on everyone else's screen declaring them the winner.
* **Interaction Model:** Local grid-toggling tied to a global win-state listener.
* **Structural Layout:** A 5x5 grid of toggleable text squares.
* **Editor Customization Options:**
  * *Content:* The list of 24 possible events.
  * *Behavior:* First-to-win ends the game vs allowing multiple winners.
  * *Structure:* Free space in the middle toggle.
* **Superpower:** This theme is the only one that generates unique randomized localized grids from a master list, while listening for a first-to-finish global trigger.

### 68. The Escape Room (Asymmetric Information)
* **Purpose:** Forcing external communication to solve a puzzle.
* **Category:** Social & Collaborative
* **Unique Functionality:** 3 users open the same link. User 1's screen only shows a red triangle and the number 4. User 2 sees a blue square and 7. User 3 sees a keypad. They must talk in real life or via chat to figure out the code to unlock the card.
* **Interaction Model:** Client-based conditional rendering (asymmetric UI).
* **Structural Layout:** The UI renders completely different components based on the user's session ID or join order.
* **Editor Customization Options:**
  * *Content:* The final unlocked message.
  * *Behavior:* The logic tying the clues to the password.
  * *Structure:* Number of distinct roles/screens (2 to 4).
* **Superpower:** This theme is the only one that intentionally serves completely different fragments of a puzzle to different users viewing the exact same URL.

### 69. The Whisper Down The Lane
* **Purpose:** Observing the degradation of information over time.
* **Category:** Social & Collaborative
* **Unique Functionality:** User 1 records a 5-second audio clip. User 2 can only listen to it once, then must immediately record their own version trying to mimic it. User 3 mimics User 2. After 10 users, the card unlocks a gallery showing the original vs the final version.
* **Interaction Model:** Sequential audio playback and immediate re-recording.
* **Structural Layout:** A strict one-time-play audio element followed by a microphone record button.
* **Editor Customization Options:**
  * *Content:* The original seed audio/phrase.
  * *Behavior:* Number of participants required to unlock the final gallery.
  * *Structure:* Audio only vs text-based (translating languages).
* **Superpower:** This theme is the only one that forces users to consume media exactly once before demanding they recreate it from memory to pass along.

### 70. The Avatar Lineup
* **Purpose:** Creating a virtual group photo.
* **Category:** Social & Collaborative
* **Unique Functionality:** Every person who opens the link is prompted to build a simple 2D avatar (choose hair, eyes, shirt). Once saved, their avatar joins a horizontal line of all other users' avatars standing shoulder-to-shoulder on the screen.
* **Interaction Model:** Character customization appending to a 1D flexbox array.
* **Structural Layout:** A character creator modal that collapses to reveal a horizontally scrolling stage of SVG avatars.
* **Editor Customization Options:**
  * *Content:* The background scene (e.g., a beach, a concert stage).
  * *Behavior:* Can users edit their avatar after placing it?
  * *Structure:* The style of avatars (8-bit, minimalist, monsters).
* **Superpower:** This theme is the only one where the primary multiplayer output is assembling a visual lineup of user-customized composite characters.

### 71. The Live Q&A Upvoter
* **Purpose:** Crowdsourcing the most important topics.
* **Category:** Social & Collaborative
* **Unique Functionality:** Users can type questions into a feed. Every question has an upvote button. The feed constantly resorts itself so the most upvoted questions rise to the top. The creator can mark questions as "Answered," removing them from the pool.
* **Interaction Model:** Collaborative text submission and integer-based sorting.
* **Structural Layout:** A scrolling list view ordered by a numeric score property.
* **Editor Customization Options:**
  * *Content:* The topic of the Q&A.
  * *Behavior:* Can users downvote? Can users reply to questions?
  * *Structure:* Highlight color for the #1 question.
* **Superpower:** This theme is the only one that acts as a real-time, user-sorted triage system for text submissions.

### 72. The Bracket Tournament
* **Purpose:** Finding the ultimate favorite through elimination.
* **Category:** Social & Collaborative
* **Unique Functionality:** A 16-item tournament bracket. During "Round 1," all users vote on 8 head-to-head matchups. After 24 hours, the creator advances the winners, and users vote on the Final 4. This continues until a single winner remains.
* **Interaction Model:** Phased, head-to-head global voting.
* **Structural Layout:** A classic binary tree diagram that updates state globally.
* **Editor Customization Options:**
  * *Content:* The 16 starting items (images or text).
  * *Behavior:* Automatic time-based round advancement vs manual advancement.
  * *Structure:* 8-item vs 16-item bracket.
* **Superpower:** This theme is the only one that structures multiplayer voting into a stateful, multi-round elimination tree.

### 73. The Shared Countdown Modifier
* **Purpose:** A game of collective impatience.
* **Category:** Social & Collaborative
* **Unique Functionality:** A central countdown timer to an event (e.g., 5 days). The card has two buttons: "+1 Hour" and "-1 Hour". Users can tap to physically alter the global time remaining.
* **Interaction Model:** Global modification of a central timestamp.
* **Structural Layout:** A massive digital clock face with two prominent modifier buttons.
* **Editor Customization Options:**
  * *Content:* The event being counted down to.
  * *Behavior:* Modification limit per user (e.g., one tap per day), modifier value (seconds vs hours).
  * *Structure:* Clock style.
* **Superpower:** This theme is the only one that allows viewers to directly mutate the target timestamp of a global countdown.

### 74. The Word Association Chain
* **Purpose:** A psychological group experiment.
* **Category:** Social & Collaborative
* **Unique Functionality:** The screen shows a single word (e.g., "Ocean"). The user has 3 seconds to type the very first word that comes to mind. Their word becomes the prompt for the next person who opens the link. The creator can view the entire sprawling chain.
* **Interaction Model:** High-pressure sequential text association.
* **Structural Layout:** A central prominent text word that updates upon submission, with a rapidly depleting timer bar.
* **Editor Customization Options:**
  * *Content:* The starting word.
  * *Behavior:* The time limit (3 to 10 seconds).
  * *Structure:* Final visualization for the creator (list vs node-graph).
* **Superpower:** This theme is the only one that forces a fast-twitch text response to dynamically generate the prompt for the subsequent user.

### 75. The Synchronized Clap
* **Purpose:** A digital standing ovation.
* **Category:** Social & Collaborative
* **Unique Functionality:** Used at the end of a live stream or presentation. Users simply tap a "Clap" button. The card visualizes this by spawning clapping hand emojis that float up the screen. Crucially, it aggregates the speed of taps globally to generate an audible applause sound effect that gets louder and more chaotic as more people tap.
* **Interaction Model:** Global frequency aggregation mapped to audio gain.
* **Structural Layout:** A full screen particle emitter generating emojis upwards from the bottom.
* **Editor Customization Options:**
  * *Content:* The subject of the applause.
  * *Behavior:* Audio volume scaling curve.
  * *Structure:* Style of emojis (hands, hearts, stars).
* **Superpower:** This theme is the only one that translates the global frequency of simple button taps into the volume of a localized audio file.

### 76. The Global Jigsaw
* **Purpose:** A massive cooperative undertaking.
* **Category:** Social & Collaborative
* **Unique Functionality:** A single 1000-piece jigsaw puzzle. Any user who opens the link can drag pieces into place. Their moves are broadcast via websocket to all other viewers in real-time. Once the final piece is placed by anyone, the image comes alive for everyone.
* **Interaction Model:** Multiplayer real-time 2D drag-and-drop.
* **Structural Layout:** A large zoomable/pannable canvas with 1000 independent draggable sprites.
* **Editor Customization Options:**
  * *Content:* The puzzle image.
  * *Behavior:* Number of pieces (50 to 1000).
  * *Structure:* Shape of puzzle pieces (classic vs geometric).
* **Superpower:** This theme is the only one that allows unlimited users to simultaneously interact with the exact same pool of draggable physics objects.

### 77. The Pixel War
* **Purpose:** A slow-paced territorial battle.
* **Category:** Social & Collaborative
* **Unique Functionality:** A blank 100x100 pixel canvas. Users can change the color of one pixel, but then they are put on a 5-minute cooldown timer before they can change another. Communities must coordinate outside the app to draw large images pixel by pixel.
* **Interaction Model:** Rate-limited, coordinate-specific color toggling.
* **Structural Layout:** A zoomable pixel grid.
* **Editor Customization Options:**
  * *Content:* The theme or rules of the canvas.
  * *Behavior:* The cooldown duration, the canvas size.
  * *Structure:* The available color palette (e.g., 16 colors only).
* **Superpower:** This theme is the only one that enforces a strict, server-side time cooldown on a single micro-interaction (placing a pixel).

### 78. The Location Unlock (Global Scavenger)
* **Purpose:** Forcing international or widespread collaboration.
* **Category:** Social & Collaborative
* **Unique Functionality:** The content is locked. It will only unlock if 10 different people from 10 different countries (verified via IP/GPS) open the link. The card shows a map of which countries have checked in so far.
* **Interaction Model:** Passive geographical presence aggregation.
* **Structural Layout:** A world map highlighting verified countries, with a locked overlay.
* **Editor Customization Options:**
  * *Content:* The unlocked global message.
  * *Behavior:* The required number of distinct regions (cities, states, or countries).
  * *Structure:* Visual of the checklist.
* **Superpower:** This theme is the only one that uses the diverse physical geography of its viewer base as the specific key to unlock content.

### 79. The Chorus Line
* **Purpose:** Creating a unified musical chord from strangers.
* **Category:** Social & Collaborative
* **Unique Functionality:** Users are prompted to hold a button and sing/hum a single sustained note into their microphone for 3 seconds. The app analyzes the pitch and adds it to a global audio mix. Users can press "Play" to hear a chaotic, beautiful chord made of hundreds of strangers' voices.
* **Interaction Model:** Audio recording and server-side audio mixing.
* **Structural Layout:** A record button and a playback button.
* **Editor Customization Options:**
  * *Content:* A backing track (optional).
  * *Behavior:* Pitch correction (autotune to a specific key) vs raw audio.
  * *Structure:* Visualizer showing the different voices.
* **Superpower:** This theme is the only one that automatically mixes hundreds of user-submitted audio snippets into a single, playable polyphonic audio file.

### 80. The Caption Contest
* **Purpose:** Comedic crowdsourcing.
* **Category:** Social & Collaborative
* **Unique Functionality:** A single funny or ambiguous image is shown. Users submit a text caption. Below the image is a Tinder-style swiper where users swipe left or right on other people's captions to vote on them. The top-rated caption permanently locks onto the image after 24 hours.
* **Interaction Model:** Text submission followed by binary (swipe) peer-review.
* **Structural Layout:** A static image on top, text input in the middle, and a card-stack swiper on the bottom.
* **Editor Customization Options:**
  * *Content:* The target image.
  * *Behavior:* Time limit for submissions vs voting.
  * *Structure:* Font style for the final caption.
* **Superpower:** This theme is the only one that pairs text generation with binary swipe-based voting to permanently alter a static image.

### 81. The Telephone Pictionary
* **Purpose:** A hilarious game of misinterpretation.
* **Category:** Social & Collaborative
* **Unique Functionality:** A chain reaction: User 1 draws a prompt. User 2 sees the drawing and writes a description of it. User 3 sees the description (not the drawing) and draws it. This continues. The final result is a gallery showing the degradation from start to finish.
* **Interaction Model:** Alternating canvas drawing and text input.
* **Structural Layout:** State-dependent UI that serves either a canvas or a text box based on the user's position in the chain.
* **Editor Customization Options:**
  * *Content:* The initial seed prompt.
  * *Behavior:* Number of links in the chain.
  * *Structure:* Time limit per turn.
* **Superpower:** This theme is the only one that forces users to alternate between two entirely different input methods (drawing vs typing) sequentially.

### 82. The Mutual Secret Admirer
* **Purpose:** A risk-free confession mechanism.
* **Category:** Social & Collaborative
* **Unique Functionality:** The card asks "Do you have feelings for the sender?" with a "Yes" button. If the user presses "Yes", nothing happens *unless* the sender also presses "Yes" on their end. If both press it, the screen transforms into a celebration for both of them.
* **Interaction Model:** Double-blind boolean matching (like Tinder matches).
* **Structural Layout:** A simple binary question that locks state and waits for a remote boolean update.
* **Editor Customization Options:**
  * *Content:* The question, the celebration message.
  * *Behavior:* Can they retract their "Yes"?
  * *Structure:* Visual of the button (heart, lock).
* **Superpower:** This theme is the only one that uses a double-blind boolean lock, only executing a state change if two specific users provide the same affirmative input.

### 83. The Group Virtual Pet
* **Purpose:** Shared responsibility and attachment.
* **Category:** Social & Collaborative
* **Unique Functionality:** A Tamagotchi-style pet lives on the URL. Its hunger and happiness meters slowly deplete in real-time. Any visitor can tap "Feed" or "Play". If the collective group fails to visit and maintain the pet, it dies/runs away.
* **Interaction Model:** Multiplayer maintenance of a depreciating state machine.
* **Structural Layout:** A central animated sprite surrounded by depleting progress bars.
* **Editor Customization Options:**
  * *Content:* The pet graphic (dog, alien, plant).
  * *Behavior:* Depletion rate (dies in 1 day vs 1 week).
  * *Structure:* Types of interactions available.
* **Superpower:** This theme is the only one where the core content (a character) will permanently cease to exist if the collective user base does not perform regular maintenance interactions.

### 84. The Time Capsule Seal
* **Purpose:** A committed group lock-in.
* **Category:** Social & Collaborative
* **Unique Functionality:** Users add photos and messages to a shared pool. The capsule remains open until every invited member taps a physical "Turn Key" slider. Once the final person turns their key, the content vanishes and becomes inaccessible until a set date 5 years in the future.
* **Interaction Model:** Unanimous consent trigger to initiate a time-lock.
* **Structural Layout:** A gallery view that transitions into a countdown timer screen upon receiving N unanimous boolean true states.
* **Editor Customization Options:**
  * *Content:* The title of the capsule.
  * *Behavior:* The unlock date (e.g., Jan 1, 2030).
  * *Structure:* Visual of the locking mechanism (vault, buried chest).
* **Superpower:** This theme is the only one that requires 100% unanimous UI consent from a group to intentionally lock themselves out of content.

### 85. The Live Reaction Track (Video)
* **Purpose:** Capturing the emotional timeline of a media file.
* **Category:** Social & Collaborative
* **Unique Functionality:** A video plays. As users watch, they tap floating reaction buttons (Laugh, Gasp, Cry). The app records the exact timestamp of their tap. Future viewers see a timeline graph below the video showing the peaks of where previous viewers reacted.
* **Interaction Model:** Timestamped interaction logging mapped to a video player.
* **Structural Layout:** A video player with a line-graph scrub bar underneath.
* **Editor Customization Options:**
  * *Content:* The video file.
  * *Behavior:* The available reaction types.
  * *Structure:* Visualization of the timeline (bar chart vs line graph).
* **Superpower:** This theme is the only one that aggregates multiplayer interactions based on the local playback timestamp of a video file rather than real-world time.

### 86. The Blind Mad Libs
* **Purpose:** Creating absurd collaborative text.
* **Category:** Social & Collaborative
* **Unique Functionality:** The creator writes a story with blanks. User 1 is prompted *only* for "An adjective". User 2 is prompted for "A noun". They do not see the story or each other's words. Once all blanks are filled, the completed story is revealed to everyone.
* **Interaction Model:** Disconnected variable assignment.
* **Structural Layout:** A simple form input that only reveals the full text paragraph once all variables in the database are populated.
* **Editor Customization Options:**
  * *Content:* The master text with bracketed variables [Noun], [Verb].
  * *Behavior:* Can one user fill multiple blanks?
  * *Structure:* Final display styling.
* **Superpower:** This theme is the only one that asks users to define string variables completely devoid of the context in which they will be used.

### 87. The Global High Five
* **Purpose:** Finding serendipitous connections.
* **Category:** Social & Collaborative
* **Unique Functionality:** A screen with a hand outline. If the user taps the hand, it pulses. If another user anywhere in the world taps the hand within the exact same 1-second window, the screen flashes brightly and records a "Successful High Five!"
* **Interaction Model:** High-precision synchronous time-matching.
* **Structural Layout:** A single massive hit area.
* **Editor Customization Options:**
  * *Content:* The message shown on a successful high five.
  * *Behavior:* The timing window (0.5 seconds vs 2 seconds).
  * *Structure:* Hand graphic style.
* **Superpower:** This theme is the only one where an interaction relies entirely on two strangers executing a tap at the exact same millisecond.

### 88. The Digital Ouija Board
* **Purpose:** Creepy, emergent group behavior.
* **Category:** Social & Collaborative
* **Unique Functionality:** A board with letters. A virtual planchette sits in the middle. Users who touch the screen apply a small directional force to the planchette. The planchette moves based on the *average* vector of all current users' inputs, slowly drifting towards letters.
* **Interaction Model:** Averaged vector physics from multiple simultaneous touches.
* **Structural Layout:** A top-down 2D physics engine where the main object's velocity is driven by aggregating client input vectors.
* **Editor Customization Options:**
  * *Content:* The board design.
  * *Behavior:* Planchette friction, force multiplier per user.
  * *Structure:* Allowed characters on the board.
* **Superpower:** This theme is the only one that uses vector math to average the directional input of multiple users to steer a single object.

### 89. The Spot the Difference (Multiplayer)
* **Purpose:** A collaborative visual hunt.
* **Category:** Social & Collaborative
* **Unique Functionality:** Two nearly identical images. The group must find 10 differences. When User A taps a correct difference, a circle appears around it for User B in real-time. The game is won when the group collectively finds all 10.
* **Interaction Model:** Shared boolean array completion via coordinate tapping.
* **Structural Layout:** A split-screen image view.
* **Editor Customization Options:**
  * *Content:* The two images.
  * *Behavior:* Penalty for tapping wrong spots (e.g., time deduction).
  * *Structure:* Orientation (side-by-side vs top-and-bottom).
* **Superpower:** This theme is the only one where discovering a hidden hotspot immediately highlights that hotspot for all other connected users.

### 90. The Shared Budget / Goal Tracker
* **Purpose:** Financial or numerical coordination.
* **Category:** Social & Collaborative
* **Unique Functionality:** A dynamic pie chart. Users can input a line item (e.g., "Balloons: $50", "Cake: $100"). The pie chart adjusts in real-time to show the breakdown, and calculates the total per-person split for the group.
* **Interaction Model:** Ledger appending with real-time data visualization.
* **Structural Layout:** A data-entry form next to an SVG pie chart that recalculates arc angles based on the data array.
* **Editor Customization Options:**
  * *Content:* The event name.
  * *Behavior:* Currency type, whether to auto-split evenly.
  * *Structure:* Chart type (donut, pie, bar).
* **Superpower:** This theme is the only one that acts as a live, multiplayer spreadsheet generating real-time geometric data visualizations.

### 91. The Multiplayer Labyrinth
* **Purpose:** Asymmetrical cooperative gaming.
* **Category:** Social & Collaborative
* **Unique Functionality:** User 1 must tilt their phone to navigate a ball through a maze. However, there are colored doors blocking the path. User 2 has a screen with colored buttons but no maze. User 1 must tell User 2 to press the Red button to open the Red door so the ball can pass.
* **Interaction Model:** Asymmetric UI requiring out-of-band verbal coordination.
* **Structural Layout:** Two entirely distinct interfaces loaded based on role selection (Driver vs Operator).
* **Editor Customization Options:**
  * *Content:* The prize at the end of the maze.
  * *Behavior:* Maze difficulty, timer limit.
  * *Structure:* Maze aesthetic (wood, sci-fi).
* **Superpower:** This theme is the only one that requires one user to use gyroscope controls while a second user uses button controls to manipulate the same environment.

### 92. The Group Itinerary Builder
* **Purpose:** Scheduling via consensus.
* **Category:** Social & Collaborative
* **Unique Functionality:** A vertical timeline (e.g., 9 AM to 10 PM). Users can suggest activities (cards). Any user can drag and drop these cards into time slots. Users can upvote a schedule to "lock" it in.
* **Interaction Model:** Multiplayer drag-and-drop onto a 1D timeline.
* **Structural Layout:** A flexbox column representing time, with draggable elements snapping to grid blocks.
* **Editor Customization Options:**
  * *Content:* Event dates/location.
  * *Behavior:* Can users overwrite others' placements?
  * *Structure:* Time granularity (15 mins vs 1 hour blocks).
* **Superpower:** This theme is the only one that allows multiple users to reorder elements along a strict chronological Y-axis.

### 93. The Icebreaker Wheel
* **Purpose:** Forcing spotlight participation.
* **Category:** Social & Collaborative
* **Unique Functionality:** A massive spinning prize wheel. Instead of prizes, the wedges are populated automatically by the names of the people currently viewing the card. The creator spins it, and whoever it lands on is assigned a random icebreaker question to answer.
* **Interaction Model:** Roster-based dynamic probability wheel.
* **Structural Layout:** A spinning SVG wheel where the number of slices dynamically updates based on the number of active websocket connections.
* **Editor Customization Options:**
  * *Content:* The list of icebreaker questions.
  * *Behavior:* Wheel spin duration.
  * *Structure:* Colors of the wedges.
* **Superpower:** This theme is the only one that dynamically draws UI elements (wheel wedges) based entirely on the active live presence of specific users.

### 94. The Collaborative Memory Match
* **Purpose:** A massive group memory test.
* **Category:** Social & Collaborative
* **Unique Functionality:** A grid of 50 face-down cards. Any user can tap two cards to flip them. If they match, they disappear for everyone. If they don't, they flip back over. The group must work together to clear the board, often seeing cards flipped by others.
* **Interaction Model:** Multiplayer state-toggling (Card Flip).
* **Structural Layout:** A grid of CSS 3D-transforming cards.
* **Editor Customization Options:**
  * *Content:* The images on the cards.
  * *Behavior:* Flip-back delay (e.g., 2 seconds to memorize).
  * *Structure:* Grid size (4x4 up to 10x10).
* **Superpower:** This theme is the only one that turns a classic single-player memory grid into a chaotic, real-time cooperative race.

### 95. The Compliment Chain
* **Purpose:** Generating a web of positivity.
* **Category:** Social & Collaborative
* **Unique Functionality:** A visual node graph. User A writes a compliment to User B. User B receives an alert, reads it, and is then prompted to write one for User C. The card visualizes this as a growing web of connected nodes, showing who uplifted whom.
* **Interaction Model:** Directed graph generation via user text input.
* **Structural Layout:** A D3.js force-directed graph visualizing relationships.
* **Editor Customization Options:**
  * *Content:* The seed compliment.
  * *Behavior:* Can a user be complimented twice?
  * *Structure:* Node visual style.
* **Superpower:** This theme is the only one that maps sequential user text inputs into a multi-directional visual relationship node graph.

### 96. The Live Sentiment Ticker
* **Purpose:** Tracking group vibes like the stock market.
* **Category:** Social & Collaborative
* **Unique Functionality:** During a live event (like watching a movie), users have a slider from "Boring" to "Exciting". They move the slider as their mood changes. The card displays a Wall Street-style scrolling ticker and a line graph showing the moving average of the group's excitement.
* **Interaction Model:** Continuous parameter adjusting aggregated into a moving average.
* **Structural Layout:** A large line graph (like Robinhood) and a single continuous input slider.
* **Editor Customization Options:**
  * *Content:* The extremes of the slider (e.g., Sad vs Happy).
  * *Behavior:* Aggregation window (average of last 5 seconds).
  * *Structure:* Line graph color (green for up, red for down).
* **Superpower:** This theme is the only one that continuously calculates and visualizes the moving average of multiple users' slider inputs.

### 97. The Trust Fall
* **Purpose:** Testing reaction time and dependability.
* **Category:** Social & Collaborative
* **Unique Functionality:** User 1 taps "Fall". A weight on screen begins to drop. User 2's screen suddenly flashes a "Catch!" button. User 2 has exactly 1 second to tap it. If they do, the card opens. If they miss, the screen "shatters" and they must restart.
* **Interaction Model:** Initiated event requiring a secondary user's timed response.
* **Structural Layout:** Asymmetric UI where an animation on one client dictates a strict timeout event on another client.
* **Editor Customization Options:**
  * *Content:* The unlocked content upon success.
  * *Behavior:* The catch window duration (0.5s to 2s).
  * *Structure:* The visual metaphor (dropping a vase, falling person).
* **Superpower:** This theme is the only one where User A's action initiates a strict, fast-twitch fail state that can only be prevented by User B.

### 98. The Crowd-Sourced Choose Your Own Adventure
* **Purpose:** Democratic storytelling.
* **Category:** Social & Collaborative
* **Unique Functionality:** A story node is presented with two choices (e.g., "Open door" or "Run away"). Users vote for 1 hour. Whichever choice wins becomes canon, the story advances to that node, and a new vote begins for the next branch.
* **Interaction Model:** Time-gated group voting to navigate a tree structure.
* **Structural Layout:** A reading pane followed by two voting buttons and a countdown timer.
* **Editor Customization Options:**
  * *Content:* The entire branching narrative text.
  * *Behavior:* Vote duration per node.
  * *Structure:* Tree depth.
* **Superpower:** This theme is the only one that permanently navigates a branching narrative based on the majority vote of the audience at discrete intervals.

### 99. The Shared Canvas Mask
* **Purpose:** Revealing an image through collective scribbling.
* **Category:** Social & Collaborative
* **Unique Functionality:** A hidden image is covered by a black mask. Users can use their finger to erase the mask. However, the mask is massive. It requires dozens of users scribbling for minutes to erase enough of the black layer to reveal the image underneath for everyone.
* **Interaction Model:** Multiplayer cumulative canvas masking.
* **Structural Layout:** A global HTML canvas overlay where every user's path-drawing clears pixels for everyone.
* **Editor Customization Options:**
  * *Content:* The hidden background.
  * *Behavior:* Eraser brush size.
  * *Structure:* Color of the mask layer.
* **Superpower:** This theme is the only one that treats a localized swipe-to-erase interaction as a globally synchronized canvas update.

### 100. The Passcode Fragments
* **Purpose:** Distributing the keys to the castle.
* **Category:** Social & Collaborative
* **Unique Functionality:** The card requires a 12-digit code to open. The creator generates the link and sends it to 4 different people. The system automatically gives Person A the first 3 digits, Person B the next 3, etc. They must communicate to assemble the full code and type it in.
* **Interaction Model:** Automated string chunking and distributed delivery.
* **Structural Layout:** A standard keypad entry, but the initial load state assigns and displays a substring to the user based on their unique visit.
* **Editor Customization Options:**
  * *Content:* The locked file/message.
  * *Behavior:* Code length, number of fragments.
  * *Structure:* Visual of the passcode slip.
* **Superpower:** This theme is the only one that automatically splices a passcode string and distributes the fragments asymmetrically to different visitors.
