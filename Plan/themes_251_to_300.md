# Category 6: Utility & Tracking (Themes 251 - 300)

### 251. The Real-Time Grocery Sync
* **Purpose:** Frictionless household management.
* **Category:** Utility & Tracking
* **Unique Functionality:** A simple checklist. However, it relies heavily on WebSockets. If User A crosses off "Milk" at the store, the word "Milk" instantly strikes through and fades away on User B's screen at home, in real-time, without refreshing.
* **Interaction Model:** Real-time multi-client DOM synchronization.
* **Structural Layout:** A dynamic array rendered as a list, tied to a WebSocket listener that broadcasts `array.splice()` mutations.
* **Editor Customization Options:**
  * *Content:* The initial list items.
  * *Behavior:* Do crossed-off items delete immediately or drop to a "Completed" section?
  * *Structure:* List aesthetic (notepad, minimal UI).
* **Superpower:** This theme is the only one designed explicitly as a live, multi-user synchronized data array where state changes push instantly to all connected clients.

### 252. The Medication Adherence Chart
* **Purpose:** Health tracking with visual accountability.
* **Category:** Utility & Tracking
* **Unique Functionality:** A giant button: "Took Pill". Tapping it logs the exact timestamp. Below is a 30-day calendar grid. Days taken turn green; missed days turn red. The app calculates and displays a live "Adherence Percentage" (e.g., 94%).
* **Interaction Model:** Single-tap event logging driving data visualization.
* **Structural Layout:** A Boolean state-logger appending to a `localStorage` array, rendered via a CSS Grid heat-map.
* **Editor Customization Options:**
  * *Content:* The name of the medication.
  * *Behavior:* Required frequency (once a day, twice a day).
  * *Structure:* Visual of the tracker (pill bottle, calendar).
* **Superpower:** This theme is the only one that maps simple boolean taps to a continuous mathematical adherence percentage visualized over a 30-day matrix.

### 253. The Dynamic Bill Splitter
* **Purpose:** Frictionless financial division.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs a total bill (e.g., $100). Below are 4 avatars representing friends. The user drags a slider under Friend 1 to 40%. The sliders for the other 3 friends instantly and automatically adjust downward (20% each) to ensure the math always equals exactly 100%, updating the dollar amounts live.
* **Interaction Model:** Interdependent range sliders with auto-balancing math.
* **Structural Layout:** Multiple range inputs bound to a reactive state manager that calculates `remainingValue / remainingSliders` on every `onInput` event.
* **Editor Customization Options:**
  * *Content:* The names of the friends.
  * *Behavior:* Add/remove people. Include tax/tip calculation layer.
  * *Structure:* Currency symbols.
* **Superpower:** This theme is the only one utilizing a system of interdependent sliders where modifying one variable automatically applies inverse mathematical constraints to the others.

### 254. The Plant Hydration Algorithm
* **Purpose:** Automated care scheduling based on species.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user adds plants (e.g., "Succulent", "Fern"). The app references a built-in JSON database of plant care to assign a watering frequency. The background of the card slowly transitions from Blue (watered) to Brown (needs water) based on the calculated elapsed time for that specific species.
* **Interaction Model:** Database-driven algorithmic timers.
* **Structural Layout:** A timer array that cross-references a static JSON dictionary to define unique countdown durations per item, modifying background CSS variables.
* **Editor Customization Options:**
  * *Content:* The user's specific plants.
  * *Behavior:* Notification triggers.
  * *Structure:* Plant illustrations.
* **Superpower:** This theme is the only one that calculates unique expiration timers by cross-referencing user inputs against an internal database of real-world biological needs.

### 255. The Seinfeld Chain (Habit Tracker)
* **Purpose:** Psychological motivation via unbroken streaks.
* **Category:** Utility & Tracking
* **Unique Functionality:** A massive, scrollable grid of 365 squares. The user taps today's square to color it in. The psychological hook is the "Chain." If they miss a day, a literal visual chain graphic connecting the colored boxes breaks, and their "Current Streak" integer resets to 0.
* **Interaction Model:** Daily binary input driving continuous line-drawing.
* **Structural Layout:** A CSS Grid where adjacent `true` values render an SVG connecting line (the chain), and a `false` value severs it.
* **Editor Customization Options:**
  * *Content:* The habit being built.
  * *Behavior:* Grace periods (e.g., 1 skip allowed per month).
  * *Structure:* Chain aesthetic (links, climbing a mountain).
* **Superpower:** This theme is the only one that uses adjacency logic to draw a continuous visual line through a calendar matrix, breaking it entirely upon a missed index.

### 256. The Group Expense Rebalancer
* **Purpose:** Complex debt simplification.
* **Category:** Utility & Tracking
* **Unique Functionality:** Three roommates enter various shared expenses over a month (A paid $50 for wifi, B paid $100 for groceries, C paid $20 for Netflix). The app runs an algorithm to simplify the debts, outputting the absolute minimum number of transactions needed to square up (e.g., "C pays B $40, A pays B $10").
* **Interaction Model:** Multi-variable input processed by a debt-simplification algorithm.
* **Structural Layout:** A ledger input form feeding into an algorithmic solver that calculates net balances and pairs debtors with creditors.
* **Editor Customization Options:**
  * *Content:* The specific shared items/categories.
  * *Behavior:* Allow uneven splits (e.g., A pays 60%).
  * *Structure:* Output format (Venmo links generated).
* **Superpower:** This theme is the only one that takes an array of multi-directional financial transactions and programmatically reduces them to the most efficient settling pathways.

### 257. The Recipe Multiplier
* **Purpose:** Instant culinary math.
* **Category:** Utility & Tracking
* **Unique Functionality:** A recipe is displayed (e.g., 2 cups flour, 1 egg). At the top is a massive "Servings" slider (default: 4). If the user drags it to 10, every single ingredient quantity in the text instantly updates (e.g., 5 cups flour, 2.5 eggs), automatically converting measurements (e.g., 4 tablespoons becomes 1/4 cup).
* **Interaction Model:** Global scalar multiplier applying contextual unit conversions.
* **Structural Layout:** A text block where numerical values and units are wrapped in reactive spans, multiplied by a global slider state, and passed through a unit-conversion switch statement.
* **Editor Customization Options:**
  * *Content:* The original recipe.
  * *Behavior:* Base servings count. Metric vs Imperial output.
  * *Structure:* Recipe card aesthetic.
* **Superpower:** This theme is the only one that isolates numerical strings within a text block to apply real-time scalar multiplication and fractional unit conversion.

### 258. The Claimable Packing List
* **Purpose:** Preventing duplicate effort in groups.
* **Category:** Utility & Tracking
* **Unique Functionality:** A list of shared trip items (Tent, Cooler, Speaker). When a user opens the link, they select their name. They tap an item to "claim" it. The item turns their specific color (e.g., Blue for John). Other users see it claimed live and cannot select it.
* **Interaction Model:** Multi-user mutually exclusive state claiming.
* **Structural Layout:** A list array where each object has a `claimedBy` property. Tapping updates the property and broadcasts to connected clients, locking the UI element.
* **Editor Customization Options:**
  * *Content:* The packing list items.
  * *Behavior:* Can you unclaim an item?
  * *Structure:* Color assignments for different users.
* **Superpower:** This theme is the only one where interacting with a list item permanently locks it to a specific user's ID and prevents interaction from other clients.

### 259. The Mood Curve Generator
* **Purpose:** Visualizing long-term emotional data.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs their mood daily on a slider from 1 (Terrible) to 10 (Amazing). The app generates a smooth, bezier-curved line graph. Over 30 days, the user can see the literal undulating wave of their emotional state, helping identify patterns (e.g., dipping every Tuesday).
* **Interaction Model:** 1D range input generating 2D graphing data.
* **Structural Layout:** A form input pushing coordinates to an SVG or Canvas graphing library (like Chart.js or D3) to render a continuous bezier curve.
* **Editor Customization Options:**
  * *Content:* The prompt (e.g., "How was your anxiety today?").
  * *Behavior:* Graph timeframe (weekly, monthly, yearly).
  * *Structure:* Graph aesthetics (smooth waves vs sharp peaks).
* **Superpower:** This theme is the only one dedicated to plotting daily subjective integer inputs onto a mathematically smoothed 2D Cartesian plane.

### 260. The Household Pet Log
* **Purpose:** Eliminating asynchronous communication gaps.
* **Category:** Utility & Tracking
* **Unique Functionality:** A massive, singular focus dashboard for one question: "Did the dog eat?" It shows a giant timestamp: "Fed 2 hours ago by Mom." Anyone in the house who opens the link instantly knows the status. Tapping the button resets the timer and logs the new user's name.
* **Interaction Model:** Single-button global state reset.
* **Structural Layout:** A minimalist UI prioritizing a single timestamp string calculation (`Date.now() - lastFedTime`), updated live.
* **Editor Customization Options:**
  * *Content:* The pet's name.
  * *Behavior:* Alert thresholds (e.g., turns red if > 12 hours).
  * *Structure:* Pet photo background.
* **Superpower:** This theme is the only one designed to answer a single, critical real-world boolean question via a shared, globally accessible timestamp delta.

### 261. The Subscription Auditor
* **Purpose:** Visualizing cumulative micro-expenses.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user lists their monthly subscriptions (Netflix $15, Spotify $10). The app displays a giant number: "You spend $300 a year on this." The user can toggle switches next to subscriptions to simulate canceling them, watching the "Yearly Savings" number instantly shoot up.
* **Interaction Model:** Boolean toggles mapped to annualized multiplication.
* **Structural Layout:** A list of active/inactive states where active items have their `(cost * 12)` summed into a primary reactive UI display.
* **Editor Customization Options:**
  * *Content:* Pre-loaded common subscriptions to audit.
  * *Behavior:* Monthly vs Yearly visualizer toggle.
  * *Structure:* Financial dashboard aesthetic.
* **Superpower:** This theme is the only one that uses toggle switches to calculate and visualize the macro-annualized impact of micro-monthly expenses.

### 262. The Roulette Chore Wheel
* **Purpose:** Gamifying undesirable tasks to remove bias.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs 5 chores and 3 roommates. The UI is a carnival spinning wheel. They tap "Spin". The wheel uses physics to spin and slowly tick to a halt, randomly assigning a specific chore to a specific roommate, removing human bias from delegation.
* **Interaction Model:** Physics-based randomized assignment.
* **Structural Layout:** An SVG wheel rotated via CSS transitions with a randomized degree target, utilizing an easing function (ease-out) to simulate friction.
* **Editor Customization Options:**
  * *Content:* The chores, the people.
  * *Behavior:* Spin duration, rigging (can prevent someone getting the worst chore twice).
  * *Structure:* Carnival wheel vs minimal spinner.
* **Superpower:** This theme is the only one that resolves array assignments through a simulated, frictionless rotational easing animation.

### 263. The Live Bar Chart Poll
* **Purpose:** Real-time group consensus gathering.
* **Category:** Utility & Tracking
* **Unique Functionality:** A question with 4 options. The user taps an option. Instantly, horizontal bar charts animate outward, showing the percentage of all friends who voted for each option in real-time. The bars physically resize as new votes come in.
* **Interaction Model:** Single-choice selection driving dynamic CSS width rendering.
* **Structural Layout:** A list where the `width` of a background `div` is bound to `(votesForOption / totalVotes) * 100%`.
* **Editor Customization Options:**
  * *Content:* The question and options.
  * *Behavior:* Allow changing votes? Hide results until voted?
  * *Structure:* Bar chart colors and typography.
* **Superpower:** This theme is the only one that maps a shared integer count to the live percentage-based CSS `width` manipulation of DOM elements.

### 264. The Decision Matrix Calculator
* **Purpose:** Mathematical logic applied to subjective choices.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user is deciding between 3 Cars. They input criteria (Price, Mileage, Looks) and assign a "Weight" (1-5) to how important each is. They then score each car 1-10 on those criteria. The app calculates the weighted sum and highlights the mathematically optimal choice.
* **Interaction Model:** Weighted multi-variable matrix calculation.
* **Structural Layout:** A 2D grid of inputs that executes a weighted sum algorithm (`(Score * Weight) + ...`) for each row array.
* **Editor Customization Options:**
  * *Content:* The options, the criteria.
  * *Behavior:* Can tie-break using a randomizer.
  * *Structure:* Spreadsheet/grid aesthetic.
* **Superpower:** This theme is the only one that uses a weighted matrix algorithm to programmatically determine and highlight an optimal choice from user-provided subjective data.

### 265. The Fade-In Event Countdown
* **Purpose:** Building anticipation through visual revelation.
* **Category:** Utility & Tracking
* **Unique Functionality:** A massive countdown timer to a future event (e.g., a wedding). The background is a photo of the venue, but it starts completely blurred/black. As the countdown approaches zero over months, the `filter: blur()` or `opacity` slowly decreases. At T-minus zero, the image is perfectly clear.
* **Interaction Model:** Macro-scale temporal mapping to CSS filter properties.
* **Structural Layout:** A timer function where the remaining percentage of the total wait-duration is mapped directly to a CSS `opacity` or `blur` variable on a background image.
* **Editor Customization Options:**
  * *Content:* The background image, the target date.
  * *Behavior:* Start date of the fade (e.g., start fading 30 days out).
  * *Structure:* Typography of the massive timer.
* **Superpower:** This theme is the only one that maps a multi-month countdown timer directly to the gradual interpolation of a CSS visual filter.

### 266. The Car Maintenance Progress Bars
* **Purpose:** Wear-and-tear tracking based on mileage.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs their current car mileage (e.g., 55,000). The app shows multiple progress bars (Oil Change, Tires, Timing Belt). As the user periodically updates their mileage, the bars fill up. When a bar hits 100% (e.g., every 5,000 miles for oil), it turns red and flashes.
* **Interaction Model:** Inputting a constantly increasing integer to drive modular thresholds.
* **Structural Layout:** An integer input driving multiple modulo/division math calculations to fill independent CSS width bars.
* **Editor Customization Options:**
  * *Content:* The specific maintenance milestones.
  * *Behavior:* Resetting a specific bar to 0 (after service).
  * *Structure:* Dashboard gauge cluster aesthetic.
* **Superpower:** This theme is the only one that uses a single constantly-increasing integer input to drive multiple independent progress bars with vastly different fill thresholds.

### 267. The Reading Progress Bookmark
* **Purpose:** Visualizing completion of long-form media.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user enters a book's total pages (e.g., 500). They periodically enter their current page (e.g., 125). The UI is a tall, vertical book spine. A digital "bookmark" physically slides 25% of the way down the screen, visually representing their journey through the physical object.
* **Interaction Model:** Fractional input mapped to physical Y-axis translation.
* **Structural Layout:** A simple `(currentPage / totalPages)` calculation mapped to the `top` or `translateY` percentage of an absolute positioned DOM element within a relative container.
* **Editor Customization Options:**
  * *Content:* The book title and cover art.
  * *Behavior:* Pages vs Chapters tracking.
  * *Structure:* Skeuomorphic physical book visual.
* **Superpower:** This theme is the only one that translates a fractional reading progress calculation into the physical vertical positioning of a skeuomorphic UI element.

### 268. The REM Sleep Cycle Calculator
* **Purpose:** Biological timing optimization.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user selects a time they *need* to wake up (e.g., 7:00 AM). The app instantly calculates backward in 90-minute REM cycle blocks (plus 15 minutes to fall asleep) and outputs the 3 optimal times to go to bed to avoid waking up groggy (e.g., 10:45 PM, 12:15 AM).
* **Interaction Model:** Reverse chronological block calculation.
* **Structural Layout:** A time-input linked to a function that subtracts fixed millisecond blocks (90 mins) from a target `Date` object and outputs an array of optimal timestamps.
* **Editor Customization Options:**
  * *Content:* Personalized sleep tips.
  * *Behavior:* Customize the REM cycle length (e.g., 100 minutes for some).
  * *Structure:* Sleepy, dark-mode night sky aesthetic.
* **Superpower:** This theme is the only one that takes a future timestamp and subtracts fixed biological time-blocks to generate an array of optimal past timestamps.

### 269. The Time-Locked Gift Vault
* **Purpose:** Preventing premature discovery.
* **Category:** Utility & Tracking
* **Unique Functionality:** A list of gift ideas for a partner. However, there is a strict logic lock: The app reads the current date. If it is the partner's birth month or the month of December (holidays), the list locks down entirely and refuses to display the ideas, preventing them from snooping when it matters most.
* **Interaction Model:** Specific calendar-month exclusionary gating.
* **Structural Layout:** A rendering block wrapped in a strict `if (currentMonth === protectedMonth)` evaluation that returns a lock screen instead of the data array.
* **Editor Customization Options:**
  * *Content:* The gift list.
  * *Behavior:* The specific exclusionary months to lock.
  * *Structure:* Vault or present visual style.
* **Superpower:** This theme is the only one designed specifically to evaluate the current month and deny access to the data structure during defined calendar windows.

### 270. The Caffeine Half-Life Tracker
* **Purpose:** Pharmacokinetic visualization.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user taps a button to log a Cup of Coffee. The app applies the standard 5-hour half-life formula of caffeine. It displays a declining curve graph showing exactly how many milligrams are currently in their bloodstream, estimating what time they will finally be able to sleep.
* **Interaction Model:** Event logging driving exponential decay math.
* **Structural Layout:** A timestamp logger that feeds a continuous exponential decay function (`amount * (0.5 ^ (hoursElapsed / 5))`) rendering a live-updating number or graph.
* **Editor Customization Options:**
  * *Content:* The types of drinks (Espresso 64mg, Energy Drink 150mg).
  * *Behavior:* Customizable half-life (varies by person).
  * *Structure:* Jittery, energetic UI that calms down as the number drops.
* **Superpower:** This theme is the only one that uses an exponential decay mathematical formula applied to a timestamped event to generate live, continuously depleting data.

### 271. The 1-Sentence Micro-Journal
* **Purpose:** Extremely low-friction daily reflection.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user is presented with a single text input box every day. It has a strict character limit (e.g., 100 characters). Once submitted, it locks for 24 hours. At the end of the month, the app stitches all 30 individual sentences together into one cohesive paragraph recounting their month.
* **Interaction Model:** Heavily constrained daily text input with monthly string concatenation.
* **Structural Layout:** A daily-locked input form pushing strings to an array. A separate view iterates the array, rendering them inline to form a standard paragraph.
* **Editor Customization Options:**
  * *Content:* Monthly summary prompts.
  * *Behavior:* Character limit per day.
  * *Structure:* Typewriter or diary aesthetic.
* **Superpower:** This theme is the only one that enforces a strict daily character limit, only to later programmatically concatenate those isolated strings into a continuous text block.

### 272. The Geo-Linked Itinerary
* **Purpose:** Fusing chronological planning with spatial navigation.
* **Category:** Utility & Tracking
* **Unique Functionality:** A timeline of a trip (10:00 AM - Museum, 1:00 PM - Lunch). Instead of just reading it, tapping any item in the timeline instantly executes a deep-link to Google Maps/Apple Maps on the user's device, pre-loaded with the exact latitude/longitude of that specific event.
* **Interaction Model:** Timeline list acting as a routing array for external protocol handlers.
* **Structural Layout:** A list array where each node contains a hidden URL scheme string (`comgooglemaps://?q=lat,lng`) triggered `onClick`.
* **Editor Customization Options:**
  * *Content:* The schedule and exact addresses.
  * *Behavior:* Open in map vs open in Uber/Lyft.
  * *Structure:* Travel ticket or passport visual aesthetic.
* **Superpower:** This theme is the only one where every item in a text timeline is explicitly configured to launch native OS mapping applications via URL scheme deep-links.

### 273. The Reverse Hourly-Rate Calculator
* **Purpose:** Goal-oriented financial calculation.
* **Category:** Utility & Tracking
* **Unique Functionality:** A freelancer inputs their *desired* lifestyle (Target Take-Home Pay, Monthly Expenses, Weeks of Vacation). The app runs the math backward (calculating taxes, subtracting non-billable hours) to output the exact Hourly Rate they *must* charge clients to achieve that lifestyle.
* **Interaction Model:** Reverse-engineered financial formulas.
* **Structural Layout:** A multi-input form feeding a complex algorithmic function that isolates a single variable (hourly rate) based on tax bracket and overhead constants.
* **Editor Customization Options:**
  * *Content:* Tooltips explaining the math.
  * *Behavior:* Local tax bracket adjustments.
  * *Structure:* Clean, professional calculator UI.
* **Superpower:** This theme is the only one that takes a user's macro end-goal integer and algorithmically deconstructs it through taxation and scheduling math to define a micro hourly metric.

### 274. The Tabata Flash Timer
* **Purpose:** Extreme visibility for physical workouts.
* **Category:** Utility & Tracking
* **Unique Functionality:** A high-intensity interval timer (e.g., 20 seconds work, 10 seconds rest). Instead of just showing numbers, the *entire screen* flashes violently. Bright Green for GO, blinding Red for REST. It is designed to be readable out of the corner of an eye from 20 feet away in a bright gym.
* **Interaction Model:** Autonomous timer driving aggressive full-viewport color shifts.
* **Structural Layout:** A looping timer utilizing CSS `vh/vw` to fill the entire viewport, swapping high-contrast background classes on specific millisecond intervals.
* **Editor Customization Options:**
  * *Content:* The workout routine text.
  * *Behavior:* Work duration, rest duration, number of rounds.
  * *Structure:* Extreme bold typography, maximum contrast.
* **Superpower:** This theme is the only one designed to discard all detailed UI in favor of aggressive, full-viewport CSS color flashes intended for long-distance peripheral visibility.

### 275. The Global Sync Scheduler
* **Purpose:** Solving multi-timezone coordination.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs 5 cities (e.g., Tokyo, London, NY, LA, Sydney). The app displays 5 columns. A single master slider at the bottom moves time forward globally. As the user drags the slider, the background of each column changes (Sun/Moon). The user drags until all 5 columns show "Daytime" to find a viable meeting time.
* **Interaction Model:** 1D slider governing multi-offset time manipulation.
* **Structural Layout:** A master integer (UTC time) bound to a slider. 5 child components take that UTC time, apply their specific timezone offset, and calculate their local hour to render day/night CSS.
* **Editor Customization Options:**
  * *Content:* The participant names and cities.
  * *Behavior:* Set specific "Working Hours" constraints (e.g., only show green if between 9-5 locally).
  * *Structure:* Global radar or world map aesthetic.
* **Superpower:** This theme is the only one where a single master slider simultaneously calculates and visualizes the local time offsets for multiple distinct geographical zones.

### 276. The Shared Expense Map
* **Purpose:** Geographic financial visualization.
* **Category:** Utility & Tracking
* **Unique Functionality:** Instead of a list of expenses, the user sees a Mapbox map. When they log an expense, a pin drops at their GPS location. Over time, the map generates a heat map or clustered bubbles. A massive bubble over "Starbucks" visually demonstrates where the budget is draining geographically.
* **Interaction Model:** Geo-tagging data points to generate spatial heat maps.
* **Structural Layout:** An array of transaction objects containing Lat/Lng coordinates passed to a mapping library's clustering algorithm.
* **Editor Customization Options:**
  * *Content:* The logged expenses.
  * *Behavior:* Cluster radius, heat map intensity.
  * *Structure:* Map style (dark mode, street map).
* **Superpower:** This theme is the only one that uses GPS coordinates to map financial transactions onto a 2D geographical heat map.

### 277. The Calorie Glass (Volume Visualizer)
* **Purpose:** Intuitive biological budgeting.
* **Category:** Utility & Tracking
* **Unique Functionality:** The UI is a cross-section of an empty glass. The user's calorie goal (e.g., 2000) is the brim. When they log food, brightly colored liquid drops into the glass, filling it up. The visual goal is to reach the top without "overflowing" and spilling liquid onto the screen.
* **Interaction Model:** Additive input driving Y-axis fill limits.
* **Structural Layout:** A container with `overflow: visible` where a child element's `height` is bound to `(currentCalories / maxCalories) * 100%`. Overflows trigger a CSS spillage animation.
* **Editor Customization Options:**
  * *Content:* Daily calorie limit.
  * *Behavior:* Does exercise lower the liquid level?
  * *Structure:* The container (glass of water, gas tank).
* **Superpower:** This theme is the only one that maps integer addition directly to the physical height of a simulated liquid, complete with a visual overflow state for exceeding limits.

### 278. The Habit Tamagotchi
* **Purpose:** Emotional manipulation for habit adherence.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user is trying to learn guitar. The app features a small digital pet. Every day the user checks off "Practiced Guitar", the pet eats an apple and smiles. If the user misses a day, the pet looks sick. If they miss 3 days, the pet 'dies' and resets.
* **Interaction Model:** Daily input driving state-machine sprite animation.
* **Structural Layout:** A 2D sprite engine where the active animation loop (Happy, Sad, Dead) is evaluated against the delta between `Date.now()` and `lastLogDate`.
* **Editor Customization Options:**
  * *Content:* The habit to track.
  * *Behavior:* Forgiveness window (how many days until death).
  * *Structure:* The pet (dragon, dog, robot).
* **Superpower:** This theme is the only one that ties the "health" (visual state) of an autonomous on-screen avatar directly to the frequency of user habit logging.

### 279. The Hydration Plant
* **Purpose:** Daily resetting progressive visualization.
* **Category:** Utility & Tracking
* **Unique Functionality:** A digital plant sits in a pot. The user's goal is 8 glasses of water. Every time they tap "Drank Water", the plant grows a new branch or leaf. At exactly midnight, the plant is harvested (added to a history log) and a new, tiny seed is planted for the next day.
* **Interaction Model:** Additive daily progression with a hard midnight reset.
* **Structural Layout:** An SVG graphic where specific groups/paths are revealed based on an integer counter that strictly resets to 0 via a `new Date().getHours()` check.
* **Editor Customization Options:**
  * *Content:* Goal amount (e.g., 64 oz).
  * *Behavior:* Reset time (midnight vs 4 AM).
  * *Structure:* Plant species.
* **Superpower:** This theme is the only one that uses an integer counter to build a complex SVG graphic, paired with an automated daily wipe function.

### 280. The 50-30-20 Block Sorter
* **Purpose:** High-level budget categorization.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs their monthly income (e.g., $5,000). The screen instantly divides into three massive colored blocks representing the 50/30/20 budget rule (Needs: $2500, Wants: $1500, Savings: $1000). The user can drag the dividers to custom percentages, and the dollar amounts auto-calculate.
* **Interaction Model:** Draggable layout dividers tied to proportional math.
* **Structural Layout:** A CSS Flexbox or Grid layout where dragging the boundaries dynamically updates the `flex-basis` or `grid-template-columns` properties, triggering a recalculation of the displayed integer values.
* **Editor Customization Options:**
  * *Content:* Total income.
  * *Behavior:* Lock specific sections (e.g., Savings must be 20%).
  * *Structure:* Colors of the blocks.
* **Superpower:** This theme is the only one where physically dragging the CSS layout boundaries of elements automatically recalculates financial math.

### 281. The Group Availability Grid (Heatmap)
* **Purpose:** Finding intersection points in schedules.
* **Category:** Utility & Tracking
* **Unique Functionality:** A grid of days and hours. Users are sent the link. They drag their finger over the hours they are free, painting them green with 20% opacity. As multiple users paint the grid, the overlapping hours become darker and darker green. The darkest block is the optimal meeting time.
* **Interaction Model:** Additive opacity overlay via multi-user grid painting.
* **Structural Layout:** A grid matrix where each cell tracks a `clicks` integer. The cell's `background-color` opacity is mapped directly to `(clicks / totalUsers)`.
* **Editor Customization Options:**
  * *Content:* Event name, dates.
  * *Behavior:* Require users to enter names vs anonymous.
  * *Structure:* Grid styling.
* **Superpower:** This theme is the only one that uses overlapping CSS opacity layers generated by multiple clients to visually calculate and display schedule intersections.

### 282. The Expiration Sorter
* **Purpose:** Preventing food/inventory waste.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user lists items in their fridge and their expiration dates (e.g., Milk - Jan 10). The list automatically sorts itself daily. Items more than a week out are green. Items expiring in 3 days turn yellow. Items expiring today are bright flashing red at the top of the list.
* **Interaction Model:** Automated chronological sorting and color-coding.
* **Structural Layout:** An array of objects passed through a `sort()` function based on timestamp deltas, mapped to a rendering loop that evaluates `Date.now() - expirationDate` to assign CSS classes.
* **Editor Customization Options:**
  * *Content:* Inventory items and dates.
  * *Behavior:* Notification triggers (email me 1 day before).
  * *Structure:* Kitchen/Fridge visual aesthetic.
* **Superpower:** This theme is the only one that autonomously re-sorts and recolors a list daily based on the approaching proximity of real-world dates.

### 283. The Step Counter Journey (Fantasy Map)
* **Purpose:** Gamifying physical activity with macro-scale mapping.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user logs their daily steps (or connects an API). Instead of a bar chart, the app shows a fantasy map (like Lord of the Rings). An avatar represents the user. The app translates steps into miles, and the avatar physically moves across the map towards "Mount Doom".
* **Interaction Model:** Translating external integer data into geographic map traversal.
* **Structural Layout:** A cumulative integer total divided by a stride-length constant, used to translate an icon along an SVG `<path>` using `stroke-dashoffset`.
* **Editor Customization Options:**
  * *Content:* The map image, the destination.
  * *Behavior:* Step-to-mile conversion rate.
  * *Structure:* Avatar icon.
* **Superpower:** This theme is the only one that converts an integer input (steps) into a physical distance measurement to move a UI element along a pre-drawn 2D path.

### 284. The Pomodoro Farm
* **Purpose:** Penalizing distraction during productivity sessions.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user wants to study for 25 minutes. They plant a "tomato seed" and start the timer. The screen must stay open. If they switch tabs or minimize the app (to check Instagram), the Page Visibility API detects it, the tomato plant dies instantly, and the timer resets.
* **Interaction Model:** Productivity timer enforced by strict focus-state monitoring.
* **Structural Layout:** A `setInterval` countdown timer hooked into the `document.addEventListener("visibilitychange")` API to trigger a failure state if the document is hidden.
* **Editor Customization Options:**
  * *Content:* Study goal.
  * *Behavior:* Timer duration, grace period (e.g., 5 seconds allowed to change a song).
  * *Structure:* The crop being grown.
* **Superpower:** This theme is the only one that actively leverages the browser's Visibility API to intentionally destroy the user's progress if they navigate away.

### 285. The Password Hint Generator
* **Purpose:** Secure memory jogging without data storage.
* **Category:** Utility & Tracking
* **Unique Functionality:** The app explicitly does NOT store passwords. It stores cryptic, highly personal hints that only the user understands (e.g., "The street I grew up on + the year I graduated"). The UI is designed like a secure vault, but it only returns these associative memory triggers.
* **Interaction Model:** Associative data retrieval.
* **Structural Layout:** A simple key-value dictionary disguised with high-security skeuomorphic UI.
* **Editor Customization Options:**
  * *Content:* The service names and the hints.
  * *Behavior:* Require a master PIN to view the hints.
  * *Structure:* Minimalist, secure typography.
* **Superpower:** This theme is the only one designed to securely log and retrieve highly abstract, personalized memory triggers rather than literal data.

### 286. The Milestone Timeline (Deviation Tracker)
* **Purpose:** Tracking progress against established averages.
* **Category:** Utility & Tracking
* **Unique Functionality:** A timeline for a baby's first year (e.g., Smiling, Crawling). The UI shows a central line. Tapping a milestone logs the date. The app plots it on the timeline and visually shows the deviation (e.g., a line drawing slightly left or right of center) comparing the child's date to the medical average.
* **Interaction Model:** Plotting logged timestamps against a static comparative dataset.
* **Structural Layout:** A vertical timeline graph that evaluates a user-inputted timestamp against a hardcoded average timestamp to determine the X-axis offset of a plotted node.
* **Editor Customization Options:**
  * *Content:* The baby's name, the milestones.
  * *Behavior:* Target dataset (can be used for puppy training, language learning).
  * *Structure:* Pastel, soft UI aesthetic.
* **Superpower:** This theme is the only one that visually plots user-inputted timestamps as physical deviations (X-axis offsets) from a hardcoded set of average timestamps.

### 287. The Wardrobe Randomizer
* **Purpose:** Removing decision fatigue via randomization.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs photos of 5 shirts, 5 pants, and 5 shoes. In the morning, they open the app and physically shake their phone. The device accelerometer detects the shake and spins the three arrays like a slot machine, outputting a randomized outfit combination.
* **Interaction Model:** Hardware-accelerometer triggered array randomization.
* **Structural Layout:** Three independent arrays hooked to a `DeviceMotionEvent` listener that triggers a `Math.random()` index selection upon a high acceleration spike.
* **Editor Customization Options:**
  * *Content:* The clothing images.
  * *Behavior:* Can lock an item (e.g., "I must wear these shoes, randomize the rest").
  * *Structure:* Closet/Polaroid visual aesthetic.
* **Superpower:** This theme is the only one that uses the physical shaking of the device (accelerometer data) to trigger the random generation of multi-variable arrays.

### 288. The Movie Watchlist Roulette
* **Purpose:** Forcing a shared decision.
* **Category:** Utility & Tracking
* **Unique Functionality:** A couple has a shared list of 20 movies they want to watch. They can never agree. The app has one giant button: "Decide For Us." It flashes rapidly through the list, slows down, and permanently locks onto one choice. The app then removes that movie from the pool.
* **Interaction Model:** Gamified definitive selection from a shared list.
* **Structural Layout:** An array passed to a visual easing animation (simulating a roulette wheel) that selects an index and then immediately splices that index from the array.
* **Editor Customization Options:**
  * *Content:* The movie list.
  * *Behavior:* Can you veto? (No).
  * *Structure:* Theater marquee aesthetic.
* **Superpower:** This theme is the only one designed specifically to algorithmically force a single choice from a list and permanently delete it to resolve human indecision.

### 289. The Shared Canvas (Whiteboard)
* **Purpose:** Unstructured, real-time spatial collaboration.
* **Category:** Utility & Tracking
* **Unique Functionality:** An infinite blank digital whiteboard. Users can draw with their fingers, type text, or drag images onto the canvas. Using WebSockets, every stroke and movement is instantly replicated on all other connected clients' screens, allowing for live brainstorming.
* **Interaction Model:** Real-time multi-client coordinate and stroke broadcasting.
* **Structural Layout:** An HTML5 `<canvas>` element mapping touch/mouse coordinates to a drawing context, broadcasting arrays of X/Y vectors via WebSocket.
* **Editor Customization Options:**
  * *Content:* Initial whiteboard state.
  * *Behavior:* Erase permissions.
  * *Structure:* Grid background vs blank paper.
* **Superpower:** This theme is the only one that acts as an unstructured 2D canvas, capturing and broadcasting raw X/Y drawing vectors to multiple clients simultaneously.

### 290. The Tip Calculator Dial
* **Purpose:** Ergonomic, fluid financial adjustments.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user enters the bill amount. Instead of typing a tip percentage or using a linear slider, the UI features a massive rotary dial (like a safe). The user spins the dial in a circle. Spinning clockwise fluidly increases the tip percentage (15%, 16%, 17%), instantly recalculating the total.
* **Interaction Model:** Circular drag mapping to percentage math.
* **Structural Layout:** A circular UI element where rotational drag angle is calculated and mapped to a float multiplier applied to a base integer.
* **Editor Customization Options:**
  * *Content:* The base bill input.
  * *Behavior:* Round-up functionality (snap dial to nearest whole dollar total).
  * *Structure:* Restaurant receipt visual.
* **Superpower:** This theme is the only one that uses a 360-degree rotational UI dial to fluidly adjust a mathematical multiplier applied to a financial total.

### 291. The Dimension Visualizer (AR Scale)
* **Purpose:** Intuitive understanding of spatial volume.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user is buying furniture and has dimensions (e.g., 40" x 20" x 30"). They input them. The app renders a simple 3D box of those exact proportions. Crucially, it places a standard 3D human silhouette (or a standard door frame) right next to it so the user instantly understands the physical scale.
* **Interaction Model:** Parameter-based 3D mesh generation for scale comparison.
* **Structural Layout:** A Three.js scene containing a static reference mesh (human) and a dynamic box geometry whose `scale` parameters are bound to user inputs.
* **Editor Customization Options:**
  * *Content:* The dimensions of the object.
  * *Behavior:* Unit toggle (Inches vs CM).
  * *Structure:* The reference object (human, dog, couch).
* **Superpower:** This theme is the only one that dynamically generates a 3D bounding box from user parameters specifically to visually compare its volume against a static 3D reference model.

### 292. The Price-Per-Use Calculator
* **Purpose:** Justifying purchases over time.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs a purchase (e.g., Winter Coat, $200). Every time they wear it, they open the app and tap "Wore It". The app takes the initial cost and divides it by the tap count, displaying a highly satisfying "Cost Per Wear" number that drops lower and lower (e.g., $200 -> $100 -> $2.50) over years.
* **Interaction Model:** Additive denominator division.
* **Structural Layout:** A static integer (Cost) divided by a cumulative integer counter (Uses), rendering a constantly decreasing float value.
* **Editor Customization Options:**
  * *Content:* The item name, initial cost, image.
  * *Behavior:* Goal tracking (e.g., "Get it under $1/wear").
  * *Structure:* Retail tag visual aesthetic.
* **Superpower:** This theme is the only one dedicated to recalculating a financial metric by continuously increasing the denominator via simple button presses.

### 293. The Spaced Repetition Flashcards
* **Purpose:** Algorithmic memory optimization.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user creates flashcards (e.g., for language learning). They flip a card. If they swipe right ("Easy"), the app algorithms schedule that card to not appear again for 4 days. If they swipe left ("Hard"), it puts it back in the queue for 10 minutes from now.
* **Interaction Model:** Swipe-based sorting driving temporal scheduling algorithms.
* **Structural Layout:** A deck of array objects passed through a SuperMemo2 (or similar) spaced-repetition algorithm that modifies the `nextReviewDate` property based on user swipe direction.
* **Editor Customization Options:**
  * *Content:* The card fronts and backs.
  * *Behavior:* Aggressiveness of the algorithm.
  * *Structure:* Physical index card visual.
* **Superpower:** This theme is the only one that uses directional swiping to algorithmic alter the future chronological render-schedule of a specific data node.

### 294. The Pregnancy Fruit Visualizer
* **Purpose:** Tangible visualization of biological growth.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs their due date. The app calculates the exact week of gestation. Instead of clinical data, it maps that week to a JSON array of fruits. It renders a beautiful, 3D rotatable model of that fruit (e.g., "Your baby is the size of an Avocado") that updates automatically every week.
* **Interaction Model:** Algorithmic timeline mapped to 3D model arrays.
* **Structural Layout:** A date delta calculation that outputs an integer (Weeks), which acts as the index to load a specific GLTF/OBJ 3D model into a WebGL canvas.
* **Editor Customization Options:**
  * *Content:* The due date.
  * *Behavior:* Notification on week change.
  * *Structure:* Theme (Fruits, Animals, Gadgets).
* **Superpower:** This theme is the only one that translates a specific chronological delta into loading and rendering completely different 3D models from a defined array sequence.

### 295. The Carpool Coordinator Matrix
* **Purpose:** Rule-based scheduling logic.
* **Category:** Utility & Tracking
* **Unique Functionality:** 4 parents share driving kids to school. The app is a Mon-Fri grid. When a parent taps a day to claim driving duties, the app runs logic: "Has this person driven 3 times this week?" or "Did they drive yesterday?" If yes, it blocks the selection, forcing equitable distribution of chores.
* **Interaction Model:** Grid selection constrained by array-history logic.
* **Structural Layout:** A 2D matrix where selecting a cell triggers a validation function that parses the entire matrix for frequency and adjacency rules before allowing the state change.
* **Editor Customization Options:**
  * *Content:* The parents' names, the schedule days.
  * *Behavior:* Define the specific rules (max days in a row, required days per month).
  * *Structure:* Calendar grid layout.
* **Superpower:** This theme is the only one that validates user input against a complex set of historical frequency and adjacency rules before allowing a state change on a grid.

### 296. The Sunscreen Reapplication Timer
* **Purpose:** Biological protection based on environmental data.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs their skin type (e.g., Fair, Dark) and taps "Start". The app pings a Weather API for the current UV Index at their location. It calculates exactly how long until their skin burns based on those two variables, and starts a countdown timer (e.g., 1hr 15m) to remind them to reapply sunscreen.
* **Interaction Model:** Algorithmic timer generated from external APIs and biological variables.
* **Structural Layout:** A timer initialized by a formula combining user input (skin type multiplier) and fetched JSON data (live UV index integer).
* **Editor Customization Options:**
  * *Content:* Skincare tips.
  * *Behavior:* Notification sound (beach wave sound).
  * *Structure:* Bright, sunny, high-contrast UI.
* **Superpower:** This theme is the only one that initializes a countdown timer duration by cross-referencing user biological input with live meteorological API data.

### 297. The Intermittent Fasting Ring
* **Purpose:** Circular time visualization.
* **Category:** Utility & Tracking
* **Unique Functionality:** A 24-hour clock face. The user drags a handle to draw a colored arc representing their "Eating Window" (e.g., 12 PM to 8 PM). A dot represents the current time. The app calculates whether the dot is inside the arc (Eating) or outside the arc (Fasting) and displays time remaining until the next phase.
* **Interaction Model:** Angular manipulation of an SVG arc driving time calculations.
* **Structural Layout:** An SVG circle where the `stroke-dasharray` creates an arc, and the start/end angles are mapped to 24-hour time variables to evaluate against `Date.now()`.
* **Editor Customization Options:**
  * *Content:* Motivation messages during fasting.
  * *Behavior:* Pre-set ratios (16:8, 14:10).
  * *Structure:* Minimalist ring gauge visual.
* **Superpower:** This theme is the only one that uses the manipulation of a 360-degree SVG arc to define and evaluate time-blocks on a 24-hour clock cycle.

### 298. The Shared Spotify Queue (Jukebox)
* **Purpose:** Democratic audio control without hardware sharing.
* **Category:** Utility & Tracking
* **Unique Functionality:** The host connects the app to their Spotify Premium via API. They send the web link to party guests. Guests can search Spotify within the web app and hit "Add to Queue". The app sends the API request to the host's playing device. A true digital jukebox.
* **Interaction Model:** Multi-client proxy commanding a single external hardware device.
* **Structural Layout:** A search interface utilizing the Spotify Web API, passing track URIs to the host's active playback queue via OAuth tokens.
* **Editor Customization Options:**
  * *Content:* The party name.
  * *Behavior:* Allow skipping? Limit to 1 song per user?
  * *Structure:* Neon jukebox aesthetic.
* **Superpower:** This theme is the only one designed explicitly as a multi-user proxy interface to send play-queue commands to a single external audio API.

### 299. The Micro-Investment Simulator
* **Purpose:** Visualizing compound interest.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user inputs the cost of a daily habit (e.g., $5 Coffee). They drag a slider for "Years" (e.g., 30 years). The app uses a compound interest formula (assuming 7% market return) to show a massive graph: "If you invested that $5 daily, you would have $183,000."
* **Interaction Model:** Small integer inputs generating massive algorithmic outputs.
* **Structural Layout:** A dual-input form feeding a standard compound interest loop `A = P(1 + r/n)^(nt)`, updating a massive UI integer and growth chart.
* **Editor Customization Options:**
  * *Content:* The habit being questioned.
  * *Behavior:* Adjustable interest rate slider.
  * *Structure:* Financial growth graph.
* **Superpower:** This theme is the only one focused purely on applying compound interest algorithms to micro-transactions to visualize macro-scale financial futures.

### 300. The Paint Swatch Matcher
* **Purpose:** Utilitarian color data extraction.
* **Category:** Utility & Tracking
* **Unique Functionality:** The user is remodeling. They open the camera through the web app, point it at a wall, and tap. The app grabs the exact hex code of the pixel in the center of the frame, matches it to the closest named Paint Color from a hardware store JSON database (e.g., "Sherwin Williams: Sea Salt"), and saves it to a project list.
* **Interaction Model:** Real-time camera pixel sampling mapped to a color database.
* **Structural Layout:** An HTML5 `<video>` stream drawn to a hidden `<canvas>`, where a click event extracts the `ImageData` (RGB) of a specific pixel and calculates the nearest Euclidean distance to an array of named hex values.
* **Editor Customization Options:**
  * *Content:* The saved swatches.
  * *Behavior:* Which paint brand databases to search.
  * *Structure:* Hardware store paint chip visual layout.
* **Superpower:** This theme is the only one that uses the device camera to extract specific RGB pixel data and calculate the nearest algorithmic match against a commercial color database.
