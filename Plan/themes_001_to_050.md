# Category 1: Surprise & Reveal Mechanics (Themes 1 - 25)

### 1. The Audio Scrubbing Reveal
* **Purpose:** An audio-first experience where playback directly controls visual metamorphosis.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Ties a visual state directly to an audio waveform's current time. Scrubbing forward through a voice note advances an animation frame-by-frame.
* **Interaction Model:** Drag/Scrub (horizontal continuous input on a timeline).
* **Structural Layout:** Large prominent waveform/scrubber at the bottom, dynamic visual element taking up the top 80% of the screen.
* **Editor Customization Options:**
  * *Content:* Audio file, start/end states of the visual element.
  * *Behavior:* Playback speed limits, auto-play vs manual scrub only.
  * *Structure:* Choice of tied visual (e.g., growing plant, drawing a picture).
* **Superpower:** This theme is the only one that physically links timeline scrubbing to a continuous visual metamorphosis.

### 2. The Digital Scratch-Off
* **Purpose:** A high-anticipation reveal mimicking a lottery ticket.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A foreground layer must be manually erased by continuous user friction (swiping back and forth) to reveal the background content.
* **Interaction Model:** Continuous multi-directional swiping (rubbing).
* **Structural Layout:** A two-layer stack. Top layer is an opaque mask (image or color); bottom layer is the hidden content. Progress meter shows percentage cleared.
* **Editor Customization Options:**
  * *Content:* Hidden message/image, scratch-off overlay graphic (e.g., silver foil, dirt).
  * *Behavior:* Required percentage cleared to trigger auto-reveal of the rest (e.g., 60%).
  * *Structure:* Brush size for the eraser.
* **Superpower:** This theme is the only one that requires continuous chaotic swiping (friction) to gradually uncover content.

### 3. The Gyroscope Spotlight
* **Purpose:** An exploratory reveal requiring physical movement of the device.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is entirely dark except for a small "spotlight" circle. Moving the physical phone (using device orientation) moves the spotlight around the canvas to read the hidden message.
* **Interaction Model:** Device tilting (gyroscope/accelerometer).
* **Structural Layout:** A canvas much larger than the screen size (panoramic). A static mask with a transparent hole in the center.
* **Editor Customization Options:**
  * *Content:* The large hidden panoramic image or scattered text.
  * *Behavior:* Sensitivity of the gyroscope, size of the spotlight beam.
  * *Structure:* Edge bouncing rules (does the canvas wrap around or have hard edges?).
* **Superpower:** This theme is the only one that uses the device's physical tilt as a flashlight to explore a dark digital space.

### 4. The Microphone Blow-Away
* **Purpose:** A magical, physical-world interaction to uncover a delicate message.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Uses the device microphone to detect ambient noise/blowing. The user must blow into the mic to scatter digital "dust," "leaves," or "clouds" obscuring the message.
* **Interaction Model:** Audio input (blowing/sustained sound).
* **Structural Layout:** A physics-enabled particle layer sitting on top of a static content layer.
* **Editor Customization Options:**
  * *Content:* Hidden message, type of particle (dust, dandelion seeds, fog).
  * *Behavior:* Required decibel level and duration to clear the screen.
  * *Structure:* Particle physics (gravity on/off, wind resistance).
* **Superpower:** This theme is the only one where blowing into the device microphone physically moves elements out of the way.

### 5. The Thermal Melt
* **Purpose:** A slow, patient reveal that demands uninterrupted physical touch.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A block of "ice" obscuring the content slowly melts away, but *only* while the user's thumb is actively held on the screen. Removing the thumb pauses or refreezes it.
* **Interaction Model:** Sustained long-press.
* **Structural Layout:** Full-screen static image covered by a dynamic distortion filter that gradually disappears based on input duration.
* **Editor Customization Options:**
  * *Content:* Hidden media/text.
  * *Behavior:* Total hold time required (e.g., 5 seconds vs 15 seconds), refreeze penalty.
  * *Structure:* Visual melt style (ice melting, fire burning paper, ink dissolving).
* **Superpower:** This theme is the only one that measures uninterrupted skin contact over time to unlock a transition.

### 6. The Multi-Finger Pry
* **Purpose:** A satisfying, physical gesture to forcefully open a locked message.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is split down the middle (like elevator doors or curtains). The user must place two fingers on the screen and pull them apart horizontally to force the doors open.
* **Interaction Model:** Two-finger horizontal pinch-out (spread gesture).
* **Structural Layout:** Two overlapping rectangular blocks spanning the vertical height, covering a background layer.
* **Editor Customization Options:**
  * *Content:* Exterior door graphics, interior revealed content.
  * *Behavior:* Resistance/spring-back effect (does it snap shut if let go before fully open?).
  * *Structure:* Split orientation (vertical doors vs horizontal jaws).
* **Superpower:** This theme is the only one that requires a two-finger "spreading" gesture to physically pry open a barrier.

### 7. The Magic Lens (X-Ray Scanner)
* **Purpose:** Discovering hidden truths or alternate realities behind an image.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A draggable "lens" acts as a portal to an alternate layer. Where the lens is placed, the background changes (e.g., seeing the skeleton beneath the skin, or the translation of a foreign text).
* **Interaction Model:** 2D Drag-and-drop of a UI element (the lens).
* **Structural Layout:** Two perfectly aligned images/text blocks. The top layer is visible everywhere except within the bounds of a floating draggable circle, which shows the bottom layer.
* **Editor Customization Options:**
  * *Content:* Base layer image, alternate reality layer image (must match dimensions).
  * *Behavior:* Shape and size of the lens.
  * *Structure:* Number of lenses available (e.g., a blue lens for text, a red lens for images).
* **Superpower:** This theme is the only one that allows localized, localized peeking into an alternate layer using a draggable window.

### 8. The Origami Unfold
* **Purpose:** A methodical, step-by-step unboxing of a message.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The content is folded into a 3D origami shape. The user must swipe in specific directions sequentially to unfold each crease until the paper is flat.
* **Interaction Model:** Sequential directional swiping.
* **Structural Layout:** A 3D-rendered polygon object centered on screen. Flattening reveals a 2D text/image plane.
* **Editor Customization Options:**
  * *Content:* Final flat image/message.
  * *Behavior:* Complexity of the fold (3 steps vs 10 steps).
  * *Structure:* Initial folded shape (crane, letter, fortune teller).
* **Superpower:** This theme is the only one that requires precise, sequential, directional swipes to deconstruct a 3D object into a 2D canvas.

### 9. The Combination Safe
* **Purpose:** A mystery box requiring external knowledge or guesswork.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Content is locked behind a classic spinning combination dial. The user must input a specific 3-number sequence to unlock the vault.
* **Interaction Model:** Rotary dragging (circular swipe).
* **Structural Layout:** A giant metallic dial in the center, current number display at the top, locked vault door background.
* **Editor Customization Options:**
  * *Content:* The locked item, clue text shown above the dial.
  * *Behavior:* The correct combination code, dial sensitivity.
  * *Structure:* Number of dials (1 rotary dial vs 3 separate number scrollers).
* **Superpower:** This theme is the only one that utilizes circular rotary input to input a specific numeric passcode.

### 10. The Shredder Reverser
* **Purpose:** A forensic puzzle to reconstruct a destroyed message.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A photo or document has been run through a vertical shredder. The user must drag the 5-10 vertical strips left and right to reorder them and form the original image.
* **Interaction Model:** 1D horizontal drag-and-drop sorting.
* **Structural Layout:** A full-width container filled with vertical strips of randomized order. They snap into place when aligned correctly.
* **Editor Customization Options:**
  * *Content:* The image/document to be shredded.
  * *Behavior:* Auto-snap tolerance, toggle whether correct pieces lock in place permanently.
  * *Structure:* Number of strips (difficulty level).
* **Superpower:** This theme is the only one focused entirely on repairing vertically sliced content through horizontal sorting.

### 11. The Connect the Dots
* **Purpose:** A guided reveal where the user traces the outline of the surprise.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A blank canvas with numbered dots. The user must drag a line connecting 1 -> 2 -> 3. Upon completing the final connection, the rough outline morphs into a high-fidelity image or message.
* **Interaction Model:** Continuous path tracing.
* **Structural Layout:** Full screen SVG canvas overlaid on hidden content.
* **Editor Customization Options:**
  * *Content:* The final revealed image.
  * *Behavior:* Strictness of path (can they skip numbers?), auto-fill speed upon completion.
  * *Structure:* Number of dots, path complexity.
* **Superpower:** This theme is the only one that requires tracing a specific numeric sequence across the screen to spawn an image.

### 12. The Peel and Stick
* **Purpose:** Simulating the tactile joy of peeling a sticker or screen protector.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A sticker obscures the content. The user must grab a specifically curled corner and drag it diagonally across the screen to peel it off. If they let go too early, it snaps back.
* **Interaction Model:** Diagonal drag with snap-back physics.
* **Structural Layout:** Z-indexed stack. Bottom: content. Top: sticker image with a dynamically warped corner mesh.
* **Editor Customization Options:**
  * *Content:* Sticker graphic, hidden graphic beneath.
  * *Behavior:* Resistance of the peel (heavy vinyl vs light paper).
  * *Structure:* Which corner starts curled.
* **Superpower:** This theme is the only one focused on a single, continuous diagonal pulling motion with elastic snap-back failure states.

### 13. The Foggy Window
* **Purpose:** A nostalgic, playful reveal akin to sitting in a cold car.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is covered in digital condensation. Swiping acts as a finger wiping the glass, revealing the content clearly behind the wiped paths, while the rest remains blurred.
* **Interaction Model:** Path-based masking (drawing transparent lines on an opaque layer).
* **Structural Layout:** Background image with a heavy gaussian blur and frosted glass overlay. The user's touch creates unblurred transparent trails.
* **Editor Customization Options:**
  * *Content:* The background scene.
  * *Behavior:* Does the fog slowly regenerate over time? 
  * *Structure:* Width of the "finger" wipe.
* **Superpower:** This theme is the only one where erasing a layer leaves permanent visual trails of the user's exact touch path.

### 14. The Piñata Smash
* **Purpose:** An energetic, aggressive reveal mechanism.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A central object must be tapped rapidly and repeatedly. With each tap, the object cracks and deforms. At X taps, it violently explodes to shower the screen with the hidden content.
* **Interaction Model:** Rapid, repetitive tapping (button mashing).
* **Structural Layout:** A central 3D/2D object that scales and shakes on tap. An underlying particle system for the explosion.
* **Editor Customization Options:**
  * *Content:* Piñata graphic, the "candy" (photos/messages) that bursts out.
  * *Behavior:* Number of taps required to break (e.g., 50 taps).
  * *Structure:* Explosion physics (shower down vs burst outwards).
* **Superpower:** This theme is the only one that requires high-frequency button mashing to trigger a destructive state change.

### 15. The Focus Puller
* **Purpose:** Mimicking camera optics to slowly bring a memory into clarity.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The content starts as a completely unrecognizable blur (bokeh). The user controls a vertical slider that acts as a camera lens focus ring to find the exact focal point where the image is sharp.
* **Interaction Model:** 1D vertical sliding (parameter tuning).
* **Structural Layout:** Full screen image, slider anchored to the right side. The image blur radius is mathematically mapped to the slider's distance from the "sweet spot."
* **Editor Customization Options:**
  * *Content:* The photo or text.
  * *Behavior:* Where the "sweet spot" is on the slider (top, middle, random).
  * *Structure:* Blur type (Gaussian vs Bokeh/Lens blur).
* **Superpower:** This theme is the only one that uses a UI slider to actively modulate the optical blur radius of a single image.

### 16. The Pitch Black Room (Light Switch)
* **Purpose:** A frantic search in the dark.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is pitch black. The user must blindly tap around to find a hidden, invisible "light switch." Once tapped, the lights instantly flick on, illuminating the card.
* **Interaction Model:** Blind exploratory tapping (spatial memory/luck).
* **Structural Layout:** A completely black overlay. A small, invisible hitbox placed randomly or specifically on the grid.
* **Editor Customization Options:**
  * *Content:* The lit room (revealed content).
  * *Behavior:* Size of the invisible switch hitbox, sound effects on miss.
  * *Structure:* Fixed switch location vs randomized per open.
* **Superpower:** This theme is the only one that relies entirely on blind, feedback-less tapping to hit a hidden trigger.

### 17. The Echo Location (Sonar)
* **Purpose:** A fleeting, radar-like reveal of a hidden landscape.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is dark. Tapping sends out a circular sonar "ping." As the ring expands, it temporarily illuminates whatever elements it passes over, fading back to black instantly. The user must tap multiple times to piece together the scene mentally.
* **Interaction Model:** Tap to spawn expanding radial masks.
* **Structural Layout:** Dark overlay. Taps create expanding SVG circles acting as temporary alpha masks for the content below.
* **Editor Customization Options:**
  * *Content:* The hidden map/scene.
  * *Behavior:* Ping expansion speed, ping fade time.
  * *Structure:* Maximum number of active pings allowed at once.
* **Superpower:** This theme is the only one that reveals content via expanding, temporary radial shockwaves.

### 18. The Vinyl Record Drop
* **Purpose:** An analog-style interaction for audio-visual content.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A spinning vinyl record. The user must drag the tonearm (needle) and drop it onto a specific colored groove on the record to trigger the hidden message. Dropping it on the wrong groove plays static or a decoy message.
* **Interaction Model:** Drag-and-drop targeting on a rotating object.
* **Structural Layout:** Top-down view of a turntable. Draggable tonearm pivoting from the corner.
* **Editor Customization Options:**
  * *Content:* The main audio message, decoy audio.
  * *Behavior:* Tolerance for dropping the needle precisely.
  * *Structure:* Record label art, color of the correct groove.
* **Superpower:** This theme is the only one that requires dropping a pivot-based UI element onto a spinning target.

### 19. The Heartbeat Sync
* **Purpose:** A calming, rhythm-based unlock mechanism.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A pulsing heart dictates a specific rhythm (e.g., Ba-Dum... Ba-Dum). The user must tap the screen perfectly in sync with this visual/haptic heartbeat 3 times in a row to unlock the content.
* **Interaction Model:** Rhythm matching (timing-based taps).
* **Structural Layout:** A central pulsing icon, an underlying lock mechanism that opens incrementally with correct timing.
* **Editor Customization Options:**
  * *Content:* The locked content.
  * *Behavior:* The BPM (beats per minute) of the rhythm, strictness of the timing window.
  * *Structure:* Visual indicator of success/failure per beat.
* **Superpower:** This theme is the only one that requires precise rhythmic timing synchronized with a pulsing visual to unlock.

### 20. The Word Jumble Decrypt
* **Purpose:** A cryptographic puzzle reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A text message is completely scrambled (e.g., "Hlel Wrdloo"). The user taps pairs of letters to swap their positions until the correct word/sentence is formed, which then unlocks the rest of the card.
* **Interaction Model:** Two-tap swapping (select A, select B to swap).
* **Structural Layout:** A grid of draggable/swappable letter tiles.
* **Editor Customization Options:**
  * *Content:* The passphrase to decrypt, the hidden content unlocked afterward.
  * *Behavior:* Does it lock letters that are in the correct spot?
  * *Structure:* Length of the required passphrase.
* **Superpower:** This theme is the only one where unlocking is achieved by physically swapping the positions of randomized letter characters.

### 21. The Typewriter Ribbon
* **Purpose:** A slow, mechanical text reveal driven by the user.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A blank page. The user must repeatedly tap a single oversized "Type" button. Every tap prints exactly one letter of the hidden message, accompanied by a mechanical clack.
* **Interaction Model:** Monotonous sequential tapping.
* **Structural Layout:** A large paper view taking up the top 70%. A vintage typewriter keyboard (or single large button) at the bottom.
* **Editor Customization Options:**
  * *Content:* The full text message.
  * *Behavior:* Typing speed (can they hold to type, or must they tap individually?).
  * *Structure:* Font style (typewriter, handwriting).
* **Superpower:** This theme is the only one where a single button press advances the revelation of a text string by exactly one character at a time.

### 22. The Kaleidoscope Spin
* **Purpose:** A mesmerizing, disorienting reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The image is fractured into a 12-point kaleidoscope pattern, making it unrecognizable. The user must drag a dial around the edge to slowly un-fracture the image until it coalesces into a single flat photo.
* **Interaction Model:** Circular parameter dragging to control a shader/filter.
* **Structural Layout:** Full screen WebGL shader effect driven by a radial slider around the screen bezel.
* **Editor Customization Options:**
  * *Content:* The target photo.
  * *Behavior:* Number of kaleidoscope mirrors (complexity).
  * *Structure:* Direction of spin required to resolve.
* **Superpower:** This theme is the only one that uses a radial dial to manipulate the mirror-count of a geometric fractal shader.

### 23. The Magnets in Sand
* **Purpose:** A physics-based exploration.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is filled with metallic sand particles. The user drags a virtual "magnet" around the screen. The sand physically pulls towards the magnet, revealing the hidden image buried underneath the sand.
* **Interaction Model:** Dragging a physics attractor.
* **Structural Layout:** A particle simulation layer over a static background image.
* **Editor Customization Options:**
  * *Content:* The buried image.
  * *Behavior:* Magnet strength, sand gravity.
  * *Structure:* Sand color/texture.
* **Superpower:** This theme is the only one that uses a draggable physics attractor to dynamically displace a layer of particles.

### 24. The Blacklight Scan
* **Purpose:** Uncovering invisible ink through a specialized lens.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The card appears to have normal, innocuous text. The user holds a "UV Light" button, which turns the screen purple and reveals hidden "invisible ink" text written between the lines of the normal text.
* **Interaction Model:** Mode toggling (Hold-to-activate alternative view).
* **Structural Layout:** Two overlapping text layouts. The UV mode swaps the color palette and fades in the hidden text blocks.
* **Editor Customization Options:**
  * *Content:* The "safe" surface text, the hidden "secret" text.
  * *Behavior:* Hold-to-view vs Toggle-to-view.
  * *Structure:* Color of the UV light effect.
* **Superpower:** This theme is the only one that uses a state-toggle to interleave a secondary set of text seamlessly between a primary set of text.

### 25. The Constellation Connect
* **Purpose:** A celestial, slow-paced drawing reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A night sky with stars. The user drags lines between specific pulsing stars. Unlike "Connect the Dots," this requires finding the correct pairs based on visual cues (e.g., matching colors or pulse rates) to draw a specific shape, which then unlocks the card.
* **Interaction Model:** Pairing/Node connection based on visual logic.
* **Structural Layout:** A scattered node graph.
* **Editor Customization Options:**
  * *Content:* The final shape drawn, the unlocked message.
  * *Behavior:* Rules for matching (e.g., connect red to red, or fast-pulse to slow-pulse).
  * *Structure:* Number of decoy stars that shouldn't be connected.
* **Superpower:** This theme is the only one that requires drawing edges between nodes based on matching dynamic visual properties rather than sequence.

### 26. The Matryoshka Doll (Russian Doll)
* **Purpose:** A deeply nested, repetitive tease.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The user is presented with a container. Tapping it opens it to reveal a slightly smaller container. This process repeats multiple times, building anticipation until the final, smallest layer contains the actual message.
* **Interaction Model:** Repetitive nested tapping.
* **Structural Layout:** A stack of perfectly nested scalable SVGs or images that shrink and disappear on tap.
* **Editor Customization Options:**
  * *Content:* The final hidden item.
  * *Behavior:* Number of nested layers (e.g., 3 vs 10).
  * *Structure:* Visual style of the containers (boxes, dolls, envelopes).
* **Superpower:** This theme is the only one that uses literal recursive nesting of containers to artificially delay the final reveal.

### 27. The Digital Zipper
* **Purpose:** A satisfying vertical split reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A highly detailed zipper graphic runs down the center of the screen. The user must drag the zipper pull downwards. As it moves, the left and right sides of the top layer split and fold back to reveal the content.
* **Interaction Model:** 1D vertical drag-down with mask splitting.
* **Structural Layout:** A left and right overlay panel that translate outwards horizontally as a central slider (the zipper) translates vertically downwards.
* **Editor Customization Options:**
  * *Content:* The hidden background, the exterior texture (denim, leather).
  * *Behavior:* Zipper friction/speed.
  * *Structure:* Direction of zip (top-to-bottom vs side-to-side).
* **Superpower:** This theme is the only one that couples a 1D vertical drag to a synchronized 2D horizontal parting of a cover layer.

### 28. The Blowtorch Burn
* **Purpose:** A destructive, slow-paced uncovering.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The user drags a virtual "flame" across a solid sheet of digital paper. Where the flame touches, the paper chars and burns away in an expanding radius, revealing the fire-proof message underneath.
* **Interaction Model:** Drag-to-destroy (radius-based path erasure).
* **Structural Layout:** A burnable top layer over a static bottom layer.
* **Editor Customization Options:**
  * *Content:* The top paper texture, the hidden content.
  * *Behavior:* Burn spread rate (does the fire spread slightly after the touch leaves?).
  * *Structure:* Size of the flame.
* **Superpower:** This theme is the only one where erasing the top layer has a "spread" physics mechanic that continues slightly after user input stops.

### 29. The Balloon Pop
* **Purpose:** A tension-building, loud reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A small balloon sits on the screen. The user must pump it up by repeatedly swiping upward on a "pump" handle. The balloon scales up until it visually pops, showering confetti and revealing the message.
* **Interaction Model:** Repetitive linear swiping (pumping).
* **Structural Layout:** A balloon element that scales uniformly with every swipe, over a hidden background.
* **Editor Customization Options:**
  * *Content:* The message inside the balloon.
  * *Behavior:* Number of pumps required to pop.
  * *Structure:* Visual tension cues (balloon shaking/turning red near popping point).
* **Superpower:** This theme is the only one that uses repetitive directional swiping to inflate a vector shape until a maximum scale threshold is crossed.

### 30. The Darkroom Photometer
* **Purpose:** A physical environment puzzle.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Uses the device's Ambient Light Sensor API. The digital photo is entirely white/overexposed. The user must physically walk into a dark room (or cover the top of their phone) to "develop" the photo and see the content.
* **Interaction Model:** Physical environment manipulation (ambient light).
* **Structural Layout:** A single image whose exposure/brightness CSS filter is inversely bound to the device's lux sensor value.
* **Editor Customization Options:**
  * *Content:* The photo/message.
  * *Behavior:* The lux threshold required to reach full visibility.
  * *Structure:* The darkroom UI aesthetic.
* **Superpower:** This theme is the only one that forces the user to change their real-world lighting environment to reveal digital content.

### 31. The Jigsaw Assembly
* **Purpose:** A classic cognitive puzzle.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A photo is broken into 9 interlocking jigsaw pieces scattered on a board. The user must drag and drop them into a 3x3 grid. When the last piece snaps in, the puzzle lines disappear, creating a seamless image.
* **Interaction Model:** 2D Drag-and-drop to specific grid targets.
* **Structural Layout:** A canvas with draggable sprites and invisible drop zones with snap-to-grid logic.
* **Editor Customization Options:**
  * *Content:* The puzzle image.
  * *Behavior:* Snap tolerance.
  * *Structure:* Grid complexity (2x2 up to 4x4).
* **Superpower:** This theme is the only one that requires reassembling fragmented 2D tiles into a fixed spatial grid to form a complete image.

### 32. The Water Pour
* **Purpose:** A fluid-dynamics reveal using gravity.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen represents a glass filled with opaque, murky water, obscuring a photo placed behind the glass. The user must tilt their device to physically "pour" the simulated water out of the screen, lowering the water level to reveal the photo.
* **Interaction Model:** Gyroscopic fluid displacement.
* **Structural Layout:** A 2D liquid simulation overlaying a static background.
* **Editor Customization Options:**
  * *Content:* The photo at the bottom of the glass.
  * *Behavior:* Fluid viscosity and pour rate.
  * *Structure:* Color of the murky liquid.
* **Superpower:** This theme is the only one that utilizes gyroscope-driven fluid physics to drain a masking layer off the screen.

### 33. The Word Search Highlighter
* **Purpose:** A vocabulary-based discovery.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The card is a grid of random letters. The user must find a specific hidden word (e.g., "SURPRISE") and drag their finger across it to highlight it. Highlighting the correct word triggers a full-screen transition.
* **Interaction Model:** Grid-based continuous dragging.
* **Structural Layout:** A 10x10 text grid. Touch input draws a highlighter trail that only locks if it matches a predefined array of coordinates.
* **Editor Customization Options:**
  * *Content:* The secret word, the revealed content.
  * *Behavior:* Diagonal words allowed vs horizontal/vertical only.
  * *Structure:* Grid size.
* **Superpower:** This theme is the only one where unlocking is achieved by dragging a continuous line over a specific sequence of letters in a dense grid.

### 34. The Simon Says Sequence
* **Purpose:** A memory-based lock.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen has four colored quadrants. They flash in a specific sequence (e.g., Red, Blue, Blue, Green). The user must mimic the sequence by tapping the quadrants. Success opens the card.
* **Interaction Model:** Memory recall and sequential tapping.
* **Structural Layout:** A 2x2 grid of colored buttons acting as a lock screen over the hidden content.
* **Editor Customization Options:**
  * *Content:* The unlocked message.
  * *Behavior:* Length of the sequence (e.g., 4 flashes vs 8 flashes).
  * *Structure:* Colors of the quadrants.
* **Superpower:** This theme is the only one that requires the user to memorize and regurgitate a visually demonstrated sequence to proceed.

### 35. The Pendulum Swing
* **Purpose:** A test of precision timing.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A visual pendulum swings continuously left and right across the screen. The user must tap exactly when the pendulum crosses a narrow "green zone" in the dead center.
* **Interaction Model:** Precision 1-tap timing.
* **Structural Layout:** An animated swinging element over a static target zone.
* **Editor Customization Options:**
  * *Content:* The locked content.
  * *Behavior:* Pendulum speed, width of the success zone.
  * *Structure:* Pendulum visual (pocket watch, wrecking ball).
* **Superpower:** This theme is the only one that relies entirely on a single, perfectly timed tap against a continuously moving autonomous object.

### 36. The Radio Tuner
* **Purpose:** An audio-first search mechanic.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen shows a vintage radio dial. The audio plays loud white noise. The user must spin a large tuning knob to find the specific frequency where the white noise fades out and the sender's voice message fades in clearly.
* **Interaction Model:** Rotary scrubbing to find a parameter sweet-spot.
* **Structural Layout:** A large circular dial. Audio crossfading is mathematically mapped to the dial's rotation angle.
* **Editor Customization Options:**
  * *Content:* The hidden audio message.
  * *Behavior:* Width of the clear audio frequency band.
  * *Structure:* Dial aesthetics (vintage vs modern).
* **Superpower:** This theme is the only one that requires scanning a 1D rotary axis to isolate a clear audio signal from generated white noise.

### 37. The Vertical Tumbler Lock
* **Purpose:** A classic briefcase-style lock.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A lock with 3 or 4 vertical scrolling number wheels (0-9). The user swipes up and down on each column to align the correct numbers in the center row.
* **Interaction Model:** Multi-column vertical snapping scroll.
* **Structural Layout:** 3-4 distinct vertical scrollable lists with snap-to-center physics.
* **Editor Customization Options:**
  * *Content:* The hidden content, the hint.
  * *Behavior:* The correct combination code.
  * *Structure:* Number of wheels (complexity).
* **Superpower:** This theme is the only one that uses multiple independent vertical scroll-snapping columns to input a numeric code.

### 38. The Magic 8-Ball Shake
* **Purpose:** A physical, nostalgic reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen shows dark blue liquid. The user must vigorously shake their phone back and forth. The accelerometer detects the shaking, causing a 20-sided die with the message to slowly float up to the surface.
* **Interaction Model:** Vigorous device shaking (accelerometer velocity threshold).
* **Structural Layout:** A static viewport with a 3D or CSS-scaled text element that transitions its Z-index/scale based on shake intensity.
* **Editor Customization Options:**
  * *Content:* The short text message on the die.
  * *Behavior:* Shake intensity required.
  * *Structure:* Color of the liquid/theme.
* **Superpower:** This theme is the only one that requires high-velocity, multi-directional physical device shaking to trigger a reveal.

### 39. The Command Line Override
* **Purpose:** A hacker-themed puzzle.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A faux terminal screen with a blinking cursor. The user must physically type a specific text command (e.g., `run surprise.exe`) using their system keyboard to bypass the firewall and see the card.
* **Interaction Model:** Explicit string typing (keyboard input).
* **Structural Layout:** A full-screen text input area styled like a monospace terminal.
* **Editor Customization Options:**
  * *Content:* The required command string, the hidden payload.
  * *Behavior:* Case sensitivity.
  * *Structure:* Terminal colors (green on black, amber on black).
* **Superpower:** This theme is the only one that requires the user to open their device keyboard and type a specific exact string to bypass a lock.

### 40. The Keyhole Pinch
* **Purpose:** A voyeuristic perspective shift.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is black except for a tiny keyhole shape. The user cannot pan the image behind it; instead, they must use a two-finger pinch-to-zoom gesture on the keyhole itself to expand the hole until it reveals the entire scene.
* **Interaction Model:** Two-finger zoom/scale gesture on a masking layer.
* **Structural Layout:** A static background image. A foreground black layer with a keyhole-shaped transparent mask that scales up based on pinch distance.
* **Editor Customization Options:**
  * *Content:* The background scene.
  * *Behavior:* Zoom resistance (how much pinching is required).
  * *Structure:* Shape of the hole (keyhole, crack, circle).
* **Superpower:** This theme is the only one that uses a two-finger zoom gesture to scale a transparent mask rather than scaling the image itself.

### 41. The Tape Rewind
* **Purpose:** A nostalgic delay mechanic.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A video or audio message is presented at the very end of the track. To play it, the user must hold down a physical UI "Rewind" button and watch the tape spin backwards until it hits 0:00, at which point it auto-plays forward.
* **Interaction Model:** Sustained button hold to manipulate timeline position.
* **Structural Layout:** A media player locked at the final frame, with all controls disabled except "Rewind."
* **Editor Customization Options:**
  * *Content:* The video/audio file.
  * *Behavior:* Rewind speed multiplier (e.g., rewinds at 5x speed).
  * *Structure:* Cassette tape vs VHS tape aesthetic.
* **Superpower:** This theme is the only one that forces the user to manually rewind media to the beginning before it is allowed to play.

### 42. The Volume Threshold (Glass Shatter)
* **Purpose:** An aggressive vocal interaction.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The content is trapped behind digital glass. The user must make a loud, sustained noise (shout, whistle, or sing) into the microphone. The glass visual vibrates based on decibel level and eventually shatters when a peak threshold is hit.
* **Interaction Model:** High-decibel audio input.
* **Structural Layout:** A shatter-able glass overlay tracking microphone volume input.
* **Editor Customization Options:**
  * *Content:* The hidden content.
  * *Behavior:* Required decibel peak to shatter.
  * *Structure:* Glass visual style (frosted, clear, stained).
* **Superpower:** This theme is the only one that measures peak microphone volume to trigger a destructive state change.

### 43. The Compass Bearing
* **Purpose:** A navigation-based lock.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Uses the device magnetometer (compass). The card instructs the user to "Face North." As they physically turn their body in the real world, a dial on screen rotates. When they align with the exact required degree bearing, the card unlocks.
* **Interaction Model:** Physical body rotation (magnetometer alignment).
* **Structural Layout:** A digital compass UI overlaid on the locked state.
* **Editor Customization Options:**
  * *Content:* The hidden message.
  * *Behavior:* The target bearing (e.g., True North, or specific degree like 180 South), tolerance margin (+/- 5 degrees).
  * *Structure:* Compass design.
* **Superpower:** This theme is the only one that requires the user to orient their physical body toward a specific magnetic direction.

### 44. The Biometric Sync (Multi-Finger Hold)
* **Purpose:** A sci-fi security clearance mechanic.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen displays 3 or 4 specific fingerprint zones. The user must place and hold multiple fingers on all zones simultaneously for 3 seconds to "authenticate" and open the file.
* **Interaction Model:** Multi-touch sustained hold.
* **Structural Layout:** A grid of touch targets that must all register active states concurrently.
* **Editor Customization Options:**
  * *Content:* The highly classified document/message.
  * *Behavior:* Number of fingers required (2 to 4).
  * *Structure:* Fingerprint scanner aesthetic.
* **Superpower:** This theme is the only one that requires simultaneous, sustained multi-touch input on specific layout coordinates.

### 45. The Seed Grower
* **Purpose:** A patient, nurturing interaction.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A seed is planted in dirt. The user drags a watering can over it to water it, then taps a sun icon to shine light. Once both actions are completed, they must simply wait 5 real-world seconds while the plant animates growing, eventually blooming to reveal the message in its flower.
* **Interaction Model:** Sequential tool usage followed by a mandatory waiting period.
* **Structural Layout:** A multi-step interactive canvas with state-based animations.
* **Editor Customization Options:**
  * *Content:* The message hidden in the bloom.
  * *Behavior:* The required wait time.
  * *Structure:* Type of plant.
* **Superpower:** This theme is the only one that requires using multiple different environmental UI tools sequentially, followed by a forced delay, to reveal content.

### 46. The Cylinder Lockpick
* **Purpose:** A precision dexterity challenge.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A cross-section of a pin-tumbler lock. The user has two sliders (tension wrench and pick). They must apply slight pressure with one slider while delicately moving the other to push 3 pins to the exact correct height.
* **Interaction Model:** Dual-axis precision manipulation.
* **Structural Layout:** 2D physics puzzle with horizontal and vertical slider bounds.
* **Editor Customization Options:**
  * *Content:* The unlocked secret.
  * *Behavior:* Forgiveness/tolerance of the pin heights.
  * *Structure:* Number of pins to pick.
* **Superpower:** This theme is the only one that requires simultaneous, asymmetrical manipulation of two distinct UI sliders to solve a physics puzzle.

### 47. The Flashlight Beam (2D Drag)
* **Purpose:** Exploring a 2D space with restricted vision.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** Unlike the gyroscope version, this places a digital "flashlight" handle on the screen. The user drags the handle, and a directional cone of light follows their finger, illuminating parts of a dark room.
* **Interaction Model:** 2D Drag with a directional raycast mask.
* **Structural Layout:** A dark overlay with a transparent polygon (the light cone) whose origin and rotation are calculated based on the dragged UI element.
* **Editor Customization Options:**
  * *Content:* The hidden room/items.
  * *Behavior:* Width of the light cone.
  * *Structure:* Does the light run out of battery over time?
* **Superpower:** This theme is the only one that uses a draggable UI element to cast a directional polygon mask (cone of light) over a hidden layer.

### 48. The Hourglass Flip
* **Purpose:** Using gravity as a timer.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen shows a digital hourglass full of sand, obscuring the bottom half. The user must physically turn their phone upside down to make the sand drain into the other half, uncovering the message.
* **Interaction Model:** 180-degree device rotation (accelerometer).
* **Structural Layout:** A physics particle system constrained within an hourglass shape.
* **Editor Customization Options:**
  * *Content:* The hidden message.
  * *Behavior:* How fast the sand falls.
  * *Structure:* Sand color.
* **Superpower:** This theme is the only one that requires a full 180-degree physical inversion of the device to trigger a physics-based reveal.

### 49. The Color Matcher
* **Purpose:** A visual perception puzzle.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** A locked door has a specific target color painted on it. The user has three sliders (Cyan, Magenta, Yellow). They must mix the sliders to perfectly match the target color to unlock the door.
* **Interaction Model:** Multi-parameter visual blending.
* **Structural Layout:** Three range sliders controlling the RGB/CMY values of a central swatch block, compared against a static target block.
* **Editor Customization Options:**
  * *Content:* The target color, the unlocked content.
  * *Behavior:* Margin of error allowed (e.g., within 5% hex variance).
  * *Structure:* RGB sliders vs CMYK sliders.
* **Superpower:** This theme is the only one where unlocking is based on manually adjusting UI sliders to match a specific hexadecimal color code.

### 50. The Blinds Twist
* **Purpose:** A mechanical, rotational reveal.
* **Category:** Surprise & Reveal Mechanics
* **Unique Functionality:** The screen is covered by horizontal window blinds. Instead of pulling them up, the user must place a finger on a "wand" and rotate it in a circular motion to tilt the slats open, revealing the view outside.
* **Interaction Model:** Continuous rotational swiping (cranking).
* **Structural Layout:** A series of horizontal rects that perform a CSS 3D rotateX transform mapped directly to the cumulative rotation angle of a dial UI.
* **Editor Customization Options:**
  * *Content:* The view out the window.
  * *Behavior:* Number of rotations required to fully open.
  * *Structure:* Vertical blinds vs Horizontal blinds.
* **Superpower:** This theme is the only one that maps a rotary cranking gesture to the 3D X-axis rotation of multiple horizontal masking elements.
