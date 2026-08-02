# Category 8: Memory Preservation (Themes 351 - 400)

### 351. The Scrapbook Sandbox
* **Purpose:** Unstructured, chaotic creativity.
* **Category:** Memory Preservation
* **Unique Functionality:** A completely boundless 2D canvas. The sender uploads 20 photos and text snippets. When the receiver opens it, all assets are dumped in a pile. The receiver can freely drag, rotate, resize, and layer every single element to build their own custom scrapbook layout, which then saves its coordinate state.
* **Interaction Model:** Freeform absolute-positioning drag-and-drop.
* **Structural Layout:** A Canvas or `overflow: hidden` div where every child element has an active listener for `pointerdown`, `pointermove`, and multi-touch `pinch-to-zoom` to constantly update inline `transform` CSS variables.
* **Editor Customization Options:**
  * *Content:* The pile of raw assets (photos, stickers, tape).
  * *Behavior:* Snap to grid vs freeform.
  * *Structure:* Canvas background texture (corkboard, paper).
* **Superpower:** This theme is the only one that abandons all structural layout logic, dumping absolute-positioned DOM elements into a pile and requiring the user to manually drag and rotate them into a layout.

### 352. The Multi-Key Time Capsule
* **Purpose:** Forcing group synchronization for access.
* **Category:** Memory Preservation
* **Unique Functionality:** A digital vault holding shared college memories. It requires 3 separate passwords to open. It is sent to 3 different friends. They must coordinate and enter their unique keys *simultaneously* (within a 60-second window) to trigger the server to unlock the vault for all of them.
* **Interaction Model:** Synchronous multi-client combinatorial unlocking.
* **Structural Layout:** A WebSocket server waiting to receive 3 distinct, valid boolean payloads from 3 different IP addresses/session IDs within a defined `setTimeout` window before returning the payload.
* **Editor Customization Options:**
  * *Content:* The vault contents.
  * *Behavior:* Number of required keys (2 to 10).
  * *Structure:* Vault/Safe aesthetic.
* **Superpower:** This theme is the only one that requires simultaneous, coordinated combinatorial password inputs from multiple separate clients to decrypt a single payload.

### 353. The Audio-Anchored Album
* **Purpose:** Enforcing auditory context on visual media.
* **Category:** Memory Preservation
* **Unique Functionality:** A horizontal scrolling gallery of photos. However, as each photo snaps into the center of the viewport, the screen locks, and a specific 10-second voice note attached to that exact photo begins playing automatically. The user cannot scroll to the next photo until the audio finishes.
* **Interaction Model:** Scroll-snapping gated by audio playback duration.
* **Structural Layout:** A CSS scroll-snap container where an `IntersectionObserver` triggers `audio.play()` on the centered element, and simultaneously sets `overflow-x: hidden` on the parent until the audio fires an `onended` event.
* **Editor Customization Options:**
  * *Content:* The photos and their specific audio files.
  * *Behavior:* Allow skipping audio? (Defeats the purpose, so no).
  * *Structure:* Minimalist gallery aesthetic.
* **Superpower:** This theme is the only one that dynamically toggles the `overflow` (scrollability) of a container based on the playback state of intersecting audio elements.

### 354. The Isometric Room Builder
* **Purpose:** Spatial memory recreation.
* **Category:** Memory Preservation
* **Unique Functionality:** A 3D isometric grid representing an empty room (e.g., a childhood bedroom). The user is given an inventory of low-poly furniture (bed, desk, poster). They drag and drop the furniture onto the grid to rebuild the room from memory. Clicking placed objects reveals specific text memories about them.
* **Interaction Model:** 3D isometric grid placement and object inspection.
* **Structural Layout:** A Three.js orthographic camera scene where a drag-and-drop raycaster snaps GLTF meshes to a mathematical coordinate grid.
* **Editor Customization Options:**
  * *Content:* The specific furniture meshes and their attached text.
  * *Behavior:* Grid size.
  * *Structure:* Color palette (vaporwave, realistic, wireframe).
* **Superpower:** This theme is the only one that requires the user to place 3D meshes onto an isometric grid to physically reconstruct a spatial environment before reading its data.

### 355. The VCR Tape Tracker
* **Purpose:** Skeuomorphic media selection.
* **Category:** Memory Preservation
* **Unique Functionality:** The UI is a physical stack of VHS tapes, each labeled with a year (e.g., "Summer 1999"). Below is a VCR. The user must drag a tape down and insert it into the slot. The screen cuts to static, then plays a video memory wrapped in heavy analog tracking distortion.
* **Interaction Model:** Drag-and-drop instantiation of video filters.
* **Structural Layout:** A drag event that checks for intersection with a 'VCR' div. If true, it triggers a fullscreen video overlay utilizing CSS mix-blend-modes and SVG displacement maps to simulate VHS noise.
* **Editor Customization Options:**
  * *Content:* The videos and tape labels.
  * *Behavior:* Auto-eject at end of video.
  * *Structure:* Heavy 90s analog aesthetic.
* **Superpower:** This theme is the only one that requires dragging a 2D DOM element into a specific drop-zone to trigger a fullscreen video node heavily processed with SVG displacement noise.

### 356. The Geographical Timeline Slider
* **Purpose:** Correlating life phases with physical locations.
* **Category:** Memory Preservation
* **Unique Functionality:** The screen is split: top is a Mapbox map, bottom is a timeline slider from 2000 to 2024. As the user scrubs the slider, a map pin physically animates across the globe (e.g., from New York to London), and a side panel updates with photos from that specific year and location.
* **Interaction Model:** 1D temporal slider driving 2D geographic interpolation.
* **Structural Layout:** A range slider whose `value` acts as an index to query an array of Lat/Lng coordinates, instructing the map camera to `flyTo()` the new coordinates while swapping a side-panel DOM array.
* **Editor Customization Options:**
  * *Content:* The years, coordinates, and photos.
  * *Behavior:* Map animation speed.
  * *Structure:* Map styling (satellite, vintage paper).
* **Superpower:** This theme is the only one where scrubbing a timeline slider directly commands a mapping API camera to fly between specific geospatial coordinates.

### 357. The Recipe Heritage Tree
* **Purpose:** Tracing the provenance of generational data.
* **Category:** Memory Preservation
* **Unique Functionality:** A branching tree graph. At the top is "Great Grandma's Apple Pie." Clicking it expands branches downwards showing who she taught it to. Clicking a specific person's node shows a photo of *their* version of the pie and their specific tweaks to the recipe (e.g., "Mom added nutmeg").
* **Interaction Model:** Hierarchical node expansion and data inheritance.
* **Structural Layout:** A collapsible JSON tree structure (like D3 hierarchy) where child nodes inherit the base text of the parent node but render their specific string mutations (deltas) highlighted.
* **Editor Customization Options:**
  * *Content:* The family tree, the recipes, the variations.
  * *Behavior:* Node layout (vertical, radial).
  * *Structure:* Rustic, cookbook aesthetic.
* **Superpower:** This theme is the only one that structures data as a hierarchical inheritance tree where child nodes specifically highlight string mutations (recipe changes) compared to their parent nodes.

### 358. The Proximity Sync Journal
* **Purpose:** Encouraging physical presence for data merging.
* **Category:** Memory Preservation
* **Unique Functionality:** Two users maintain separate daily journals on the app. The journals cannot be sent over the internet. When the two users are physically in the same room (detected via local network/Bluetooth API), the app unlocks a "Sync" button, allowing their two journals to merge into a single shared timeline.
* **Interaction Model:** Hardware-gated local network handshake.
* **Structural Layout:** Utilizing the Web Bluetooth API or local network IP matching to validate physical proximity before executing a `concat()` and `sort()` on two separate `localStorage` arrays.
* **Editor Customization Options:**
  * *Content:* The individual journal entries.
  * *Behavior:* Auto-sync vs manual button press.
  * *Structure:* Split-screen timeline visual.
* **Superpower:** This theme is the only one that strictly prevents data synchronization unless the Web Bluetooth/Local Network APIs verify the physical proximity of a second client.

### 359. The Polaroid Shaker
* **Purpose:** Physical exertion to simulate analog chemistry.
* **Category:** Memory Preservation
* **Unique Functionality:** A completely blank, dark grey polaroid frame appears on screen. Text says "Shake to develop." The user must vigorously shake their phone. The accelerometer detects the movement, slowly dropping the opacity of the grey mask, causing the photo and memory text to slowly "develop" into view.
* **Interaction Model:** Accelerometer spikes mapped to CSS opacity depletion.
* **Structural Layout:** A `DeviceMotionEvent` listener where the delta of physical acceleration subtracts from a variable `maskOpacity = 100`, which is bound to a CSS `filter: brightness()` or `opacity` property on an image overlay.
* **Editor Customization Options:**
  * *Content:* The developed photo and text.
  * *Behavior:* Required shaking intensity/duration.
  * *Structure:* Retro instant camera aesthetic.
* **Superpower:** This theme is the only one that maps continuous hardware accelerometer spikes directly to the gradual interpolation of an image mask's opacity.

### 360. The 1-Second-Everyday Stitcher
* **Purpose:** Algorithmic summarization of macro time periods.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads 30 different video clips from a month. Instead of forcing them to edit, the app runs a script: it automatically finds the mathematical middle of each clip, extracts exactly 1.0 seconds of video, and stitches all 30 clips into a seamless, rapid-fire 30-second montage.
* **Interaction Model:** Automated client-side video array slicing and concatenation.
* **Structural Layout:** Using the Media Source Extensions (MSE) or an invisible HTML5 canvas renderer to programmatically set `video.currentTime` to `(duration/2) - 0.5`, play for 1 second, and immediately jump to the next video array index.
* **Editor Customization Options:**
  * *Content:* The raw video array.
  * *Behavior:* Clip duration (1 sec, 2 sec).
  * *Structure:* Rapid-fire, energetic playback UI.
* **Superpower:** This theme is the only one that programmatically slices a uniform temporal chunk (1 second) from the middle of multiple distinct video nodes and renders them sequentially.

### 361. The Sentiment Scatterplot
* **Purpose:** Abstract visualization of life phases.
* **Category:** Memory Preservation
* **Unique Functionality:** The user has 50 logged memories. The app plots them on a massive 2D graph. X-Axis is Time. Y-Axis is Emotion (Sad to Happy). The user can see the shape of their year (e.g., a massive dip in March, a peak in July). Tapping a node on the graph opens the memory.
* **Interaction Model:** 2D Cartesian mapping of subjective data.
* **Structural Layout:** An array of objects containing `timestamp` and `emotionScore (-10 to 10)`. These integers determine the `left` and `bottom` CSS percentages of absolutely positioned DOM nodes on a grid.
* **Editor Customization Options:**
  * *Content:* The memory data points.
  * *Behavior:* Node clustering (if too dense).
  * *Structure:* Scientific graph aesthetic vs abstract constellation.
* **Superpower:** This theme is the only one that uses subjective integer scores (happiness) to dictate the absolute Y-axis positioning of data nodes on a 2D Cartesian graph.

### 362. The Vinyl Record Burner
* **Purpose:** Procedural generation based on audio input.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads an audio memory (e.g., a wedding toast). The app simulates "burning" it onto a 3D vinyl record. Crucially, it analyzes the audio frequencies and uses them to procedurally generate a unique, abstract album cover art based on the waveform of that specific memory.
* **Interaction Model:** Audio frequency analysis driving Canvas procedural generation.
* **Structural Layout:** The Web Audio API `AnalyserNode` extracts FFT (Fast Fourier Transform) data from the audio file, using the frequency bins as seed variables to draw abstract generative art (e.g., Perlin noise lines) on an HTML Canvas.
* **Editor Customization Options:**
  * *Content:* The audio file, album title.
  * *Behavior:* Generative art style (geometric, fluid, chaotic).
  * *Structure:* Record sleeve aesthetic.
* **Superpower:** This theme is the only one that extracts FFT frequency data from an uploaded audio file to procedurally generate a unique 2D Canvas image.

### 363. The Heirloom AR Scanner
* **Purpose:** Tying digital data to physical space.
* **Category:** Memory Preservation
* **Unique Functionality:** The user opens the camera and scans a specific physical object in their house (e.g., their grandfather's old watch). Using WebXR, the app recognizes the object's geometry/image target and anchors a floating digital text box to it in 3D space, detailing the history of the watch.
* **Interaction Model:** Augmented Reality image targeting.
* **Structural Layout:** A WebXR/AR.js session listening for a specific image tracking target. Upon detection, it renders a Three.js text mesh anchored to the target's 3D pose matrix.
* **Editor Customization Options:**
  * *Content:* The physical target image, the attached memory text.
  * *Behavior:* Tracking tolerance.
  * *Structure:* Floating AR hologram aesthetic.
* **Superpower:** This theme is the only one that utilizes the WebXR API to anchor digital text nodes to specific physical image targets detected through the device camera.

### 364. The Sentimental Receipt
* **Purpose:** Re-evaluating the "cost" of a memory.
* **Category:** Memory Preservation
* **Unique Functionality:** The UI is a long, scrolling, thermal-printed CVS-style receipt. Instead of items bought, it lists micro-moments from a specific event (e.g., "1st Date"). "Coffee: $4", "Laughing at my joke: Priceless", "Walking in the rain: $0.00". The "Total" at the bottom says something like "Incalculable."
* **Interaction Model:** Linear scrolling of a heavily themed list array.
* **Structural Layout:** A single-column flexbox list with a monospace font, heavily styled with CSS drop-shadows and jagged border-images to perfectly simulate thermal paper.
* **Editor Customization Options:**
  * *Content:* The line items and their "costs".
  * *Behavior:* Print animation on load (rolls out from the top).
  * *Structure:* High-contrast black and white thermal printer aesthetic.
* **Superpower:** This theme is the only one that forces all array data into a 2-column key-value format (Item : Cost) specifically designed to mimic a printed retail receipt.

### 365. The Chat Log Replay
* **Purpose:** Authentic simulation of past pacing.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads an exported text conversation (e.g., their first WhatsApp chat with their spouse). Instead of just reading it, they hit "Replay." The app perfectly simulates the original pacing. It shows "Typing..." for 5 seconds, then the message drops. It replays the conversation in real-time exactly as it happened years ago.
* **Interaction Model:** Automated chronological playback driven by timestamp deltas.
* **Structural Layout:** An array of message objects containing `timestamp` values. A recursive function calculates the delta between `Message[i]` and `Message[i+1]` and uses it as the `setTimeout` duration before rendering the next DOM element.
* **Editor Customization Options:**
  * *Content:* The chat export JSON.
  * *Behavior:* Playback speed multiplier (e.g., 2x, 5x speed).
  * *Structure:* iMessage/WhatsApp visual clone.
* **Superpower:** This theme is the only one that uses the exact chronological timestamp deltas between imported text nodes to dictate the `setTimeout` render pacing of those nodes.

### 366. The Voice-Activated Vault
* **Purpose:** Biometric acoustic security.
* **Category:** Memory Preservation
* **Unique Functionality:** A heavy steel vault door on screen. No keypad. The screen says "Speak the password." The user must say a highly specific phrase (e.g., "The night we met in Paris"). The app uses the Web Speech API to transcribe the audio. If the string perfectly matches, the vault unlocks.
* **Interaction Model:** Voice-to-text string validation.
* **Structural Layout:** The `window.SpeechRecognition` API capturing microphone input, converting it to a text string, and running a strict `===` evaluation against a stored password string to trigger a state change.
* **Editor Customization Options:**
  * *Content:* The hidden memory, the voice password.
  * *Behavior:* Case sensitivity, fuzzy matching (allowing slight mispronunciations).
  * *Structure:* High-security biometric UI.
* **Superpower:** This theme is the only one that utilizes the browser's native Speech Recognition API to convert acoustic input into a string for strict password validation.

### 367. The Generational Face Morph
* **Purpose:** Visualizing genetic continuity.
* **Category:** Memory Preservation
* **Unique Functionality:** A single portrait of a face. At the bottom is a slider labeled "Grandmother -> Mother -> Daughter". As the user drags the slider, the image uses CSS crossfading (or WebGL morph targets) to seamlessly blend the faces of three generations of women taken at the exact same age.
* **Interaction Model:** 1D slider driving multi-image opacity interpolation.
* **Structural Layout:** Three absolutely positioned images stacked on top of each other. A slider value (0 to 100) dictates the `opacity` of the middle image (peaks at 50) and top image (peaks at 100) to create a seamless 3-way crossfade.
* **Editor Customization Options:**
  * *Content:* The 3 aligned portraits.
  * *Behavior:* Snap to faces vs smooth blend.
  * *Structure:* Antique photo frame aesthetic.
* **Superpower:** This theme is the only one that uses a single slider to execute a mathematically staggered opacity crossfade across three overlapping image nodes.

### 368. The Ticket Stub Corkboard
* **Purpose:** Interactive skeuomorphic archiving.
* **Category:** Memory Preservation
* **Unique Functionality:** A digital corkboard. The user uploads photos of old concert tickets. They appear pinned to the board. The user can drag them around to organize them. Tapping a ticket triggers a 3D flip animation, revealing the blank back of the ticket where the user can type notes and memories about the show.
* **Interaction Model:** Absolute dragging combined with 3D flip-states.
* **Structural Layout:** An array of objects containing X/Y coordinates and `frontImg`/`backText` data. A drag listener updates X/Y. A click listener toggles a CSS `transform: rotateY(180deg)` class on the specific container.
* **Editor Customization Options:**
  * *Content:* The ticket images and back-notes.
  * *Behavior:* Snap to grid.
  * *Structure:* Corkboard and pushpin visual style.
* **Superpower:** This theme is the only one that combines absolute X/Y dragging of elements with a dual-sided 3D Y-axis flip interaction for data storage.

### 369. The 360-Degree Panorama Memory
* **Purpose:** Immersive spatial recall.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads a panoramic or 360-degree photo of a location (e.g., a mountain peak). The app maps it to the inside of a 3D sphere. The user must stand up and physically spin around their room; the device gyroscope pans the camera inside the sphere, allowing them to "look around" the memory.
* **Interaction Model:** Gyroscope mapping to a 3D spherical camera.
* **Structural Layout:** A Three.js scene containing a `SphereGeometry` with the image applied as a `MeshBasicMaterial(side: THREE.BackSide)`. The camera's rotation is bound to the `DeviceOrientation` API.
* **Editor Customization Options:**
  * *Content:* The 360 photo.
  * *Behavior:* Fallback to touch-drag panning for desktop/disabled users.
  * *Structure:* Clean, immersive full-screen UI.
* **Superpower:** This theme is the only one that maps an image texture to the inside of a 3D sphere and links the camera rotation exclusively to device gyroscope hardware.

### 370. The Olfactory Database (Scent Log)
* **Purpose:** Categorizing memories by an unconventional metric.
* **Category:** Memory Preservation
* **Unique Functionality:** Standard journals sort by date. This one sorts by smell. The UI is a grid of icons (Rain, Old Books, Chlorine, Pine). Tapping "Chlorine" opens a list of every memory the user has logged associated with swimming pools or summer camps. It forces associative recall over chronological recall.
* **Interaction Model:** Tag-based filtering prioritizing sensory taxonomy.
* **Structural Layout:** A JSON database of memories where the primary sorting index/key is an enumerated `scentCategory` rather than a `timestamp`.
* **Editor Customization Options:**
  * *Content:* The memories.
  * *Behavior:* Cross-referencing (e.g., sort by Scent AND Date).
  * *Structure:* Apothecary/Perfume bottle visual aesthetic.
* **Superpower:** This theme is the only one that structurally mandates that all text arrays must be categorized and retrieved via an enumerated "smell" tag rather than a chronological date.

### 371. The Hand-Drawn Neighborhood Map
* **Purpose:** Hyper-local, geographic storytelling.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads a custom, hand-drawn vector map of their childhood street. It is an SVG. Specific houses or trees are interactive paths. Tapping the "Miller's House" SVG path opens a modal with a story about breaking their window. It anchors memories to a custom, non-standard geography.
* **Interaction Model:** Interactive SVG pathing driving modal instantiation.
* **Structural Layout:** An inline SVG where specific `<path>` elements have `onClick` listeners that pass a unique ID to a function that fetches and renders the corresponding text payload in a modal.
* **Editor Customization Options:**
  * *Content:* The SVG map, the location stories.
  * *Behavior:* Map panning/zooming.
  * *Structure:* Storybook/Treasure map aesthetic.
* **Superpower:** This theme is the only one that uses custom, hand-drawn SVG paths as the exclusive clickable trigger points for data retrieval.

### 372. The CRT Channel Surfer
* **Purpose:** Nostalgic, randomized media consumption.
* **Category:** Memory Preservation
* **Unique Functionality:** A retro 1980s TV set. The user cannot pick what video memory they want to watch from a list. They must click a loud, clunky "Channel Up" dial. Changing channels triggers a blast of white noise, static, and CRT distortion before snapping to a randomized, looping video memory.
* **Interaction Model:** Sequential integer stepping with randomized array mapping and heavy interstitial masking.
* **Structural Layout:** A button that increments a counter, plays a static video overlay for 500ms, and then randomly selects an index from a video array to load into the primary `<video>` element, applying CSS scanlines.
* **Editor Customization Options:**
  * *Content:* The video array.
  * *Behavior:* Static duration.
  * *Structure:* Heavy CRT aesthetic (curvature, scanlines, chromatic aberration).
* **Superpower:** This theme is the only one that obscures array selection behind a sequential "channel" dial and forces a heavy static-noise interstitial between every data swap.

### 373. The Interview Transcript Tree
* **Purpose:** Archiving oral histories.
* **Category:** Memory Preservation
* **Unique Functionality:** It looks like a standard family tree. However, clicking a node (e.g., "Grandpa Joe") doesn't just show a birthdate. It expands the node massively to reveal a multi-page, scrolling text transcript of an interview with him, complete with embedded audio clips of him answering specific questions.
* **Interaction Model:** Massive node-expansion for long-form data reading.
* **Structural Layout:** A standard flexbox tree where clicking a node toggles a CSS class that animates its `width` and `height` to 90vw/90vh, completely taking over the layout to render a nested long-form article component.
* **Editor Customization Options:**
  * *Content:* The family nodes, the interview transcripts, the audio clips.
  * *Behavior:* Auto-pause audio when closing node.
  * *Structure:* Archival, historical document aesthetic.
* **Superpower:** This theme is the only one that uses a standard family tree node-graph as the entry point, but dynamically scales a selected node to take over the entire viewport to display long-form journalism.

### 374. The Collaborative Yearbook (Digital Signing)
* **Purpose:** Unstructured, multi-user visual annotation.
* **Category:** Memory Preservation
* **Unique Functionality:** The user's "Yearbook Page" (a photo of them). They send the link to 20 friends. Friends can use their mouse or finger to literally draw and write messages directly over the user's photo. The app composites all 20 friends' drawings into one chaotic, beautiful, permanent overlay.
* **Interaction Model:** Multi-client spatial canvas compositing.
* **Structural Layout:** A base image layer. When a client connects, they draw on a transparent Canvas. Upon save, their stroke-data array is sent to the server and permanently appended to the master render loop for that specific page.
* **Editor Customization Options:**
  * *Content:* The base photo.
  * *Behavior:* Brush colors, eraser tool.
  * *Structure:* High school yearbook aesthetic.
* **Superpower:** This theme is the only one that allows multiple remote clients to permanently draw vector strokes over a single shared background image.

### 375. The Growth Wall (Height Tracker)
* **Purpose:** Scaling digital data against a physical real-world metric.
* **Category:** Memory Preservation
* **Unique Functionality:** A digital representation of a classic doorframe height-tracker. The user inputs their child's height over years (e.g., 36", 42"). The app renders the doorframe. The UI requires the user to scroll vertically to see the marks. A 48" mark is physically rendered 4x higher on the scrollable page than a 12" mark.
* **Interaction Model:** 1:1 spatial mapping of real-world measurements to CSS pixels.
* **Structural Layout:** A vertical container where user inputs (inches) are multiplied by a constant (e.g., `1 inch = 50px`) to dictate the exact absolute `bottom` coordinate of a horizontal marker div.
* **Editor Customization Options:**
  * *Content:* The names, dates, and heights.
  * *Behavior:* Pixels-per-inch multiplier.
  * *Structure:* Doorframe/wooden wall aesthetic.
* **Superpower:** This theme is the only one that translates user-inputted real-world measurements (inches) into a strict, scaled proportional CSS pixel height to dictate layout positioning.

### 376. The Geo-Fenced Memory Vault
* **Purpose:** Tying digital retrieval strictly to physical presence.
* **Category:** Memory Preservation
* **Unique Functionality:** The sender locks a memory to a specific GPS coordinate (e.g., "The park bench where we met"). The receiver gets a map with a pin, but the memory is locked. The app uses the Geolocation API. It will absolutely refuse to open the memory until the receiver's phone physically enters a 50-meter radius of that specific real-world coordinate.
* **Interaction Model:** Real-world physical travel as the decryption key.
* **Structural Layout:** The `navigator.geolocation.watchPosition` API constantly evaluating the Haversine distance between the client's live location and a hardcoded target coordinate, unlocking the payload only when `distance < threshold`.
* **Editor Customization Options:**
  * *Content:* The locked memory.
  * *Behavior:* Radius size (50m vs 1 mile).
  * *Structure:* Radar/treasure map aesthetic.
* **Superpower:** This theme is the only one that uses the device's live GPS coordinates to physically require the user to travel to a specific real-world location to unlock the data.

### 377. The Dust Brusher
* **Purpose:** Simulating the neglect and rediscovery of old artifacts.
* **Category:** Memory Preservation
* **Unique Functionality:** An old photograph is completely obscured by a thick layer of digital dust and dirt. The user must rapidly rub their finger back and forth across the screen to wipe the dust away. If they stop, the dust slowly begins to settle back over the image.
* **Interaction Model:** Subtractive masking requiring continuous physical maintenance.
* **Structural Layout:** An HTML Canvas layered over an image. `touchmove` events draw transparent strokes (erasing the dust canvas). A `requestAnimationFrame` loop constantly adds a low-opacity black fill to the canvas, regenerating the dust over time.
* **Editor Customization Options:**
  * *Content:* The hidden photo.
  * *Behavior:* Brush size, speed of dust settling.
  * *Structure:* Attic/basement aesthetic.
* **Superpower:** This theme is the only one that uses an active Canvas rendering loop to constantly regenerate a masking layer, forcing the user to continuously erase it to maintain visibility.

### 378. The Color Palette Extractor
* **Purpose:** Abstracting literal memories into emotional aesthetics.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads a photo of a memory. The app doesn't show the photo. Instead, it runs an algorithm to extract the 5 dominant colors. It then uses those 5 hex codes to generate a massive, beautiful, abstract piece of generative art (e.g., flowing liquid or geometric shapes), turning a literal photo into a feeling.
* **Interaction Model:** Image processing to drive generative CSS/Canvas art.
* **Structural Layout:** An invisible Canvas that loads an image, samples the pixel data, runs a K-Means clustering algorithm to find dominant RGB values, and passes those colors as variables to a WebGL/CSS shader animation.
* **Editor Customization Options:**
  * *Content:* The source photo.
  * *Behavior:* Number of colors extracted.
  * *Structure:* The style of the generative art (flowing gradients, sharp polygons).
* **Superpower:** This theme is the only one that analyzes an uploaded image specifically to destroy the image and repurpose its dominant color data to colorize a secondary algorithmic art piece.

### 379. The Video Frame Slicer
* **Purpose:** Micro-analysis of a fleeting moment.
* **Category:** Memory Preservation
* **Unique Functionality:** The sender uploads a 5-second video clip. The app renders a massive grid of 150 individual still photos (assuming 30fps). The user can scroll through the entire grid, studying the micro-expressions of every single frame. Tapping a frame expands it.
* **Interaction Model:** Temporal data expanded into a spatial grid.
* **Structural Layout:** A script that iterates through a `<video>` element, seeking forward by `1/30th` of a second, drawing the frame to a canvas, exporting it as an image blob, and appending it to a CSS Grid layout.
* **Editor Customization Options:**
  * *Content:* The video clip.
  * *Behavior:* Frames per second extracted (5fps vs 30fps).
  * *Structure:* Film strip aesthetic vs tight grid.
* **Superpower:** This theme is the only one that programmatically dissects a video file into its constituent individual still frames and renders them simultaneously in a massive spatial grid.

### 380. The Audio Cassette Rewinder
* **Purpose:** Frustrating, nostalgic tactile labor.
* **Category:** Memory Preservation
* **Unique Functionality:** The UI is an audio cassette tape. To hear the next track (memory), the user cannot press "Next". They must place their finger on the left spool (the hole) and physically drag in circles to "rewind" the tape with a pencil. The faster they drag, the faster the tape rewinds.
* **Interaction Model:** Circular drag velocity mapping to audio-seek state.
* **Structural Layout:** A rotational touch listener where the delta of the rotation angle directly manipulates the `currentTime` property of the audio node and the CSS `transform: rotate()` of the visual tape spools.
* **Editor Customization Options:**
  * *Content:* The audio memories.
  * *Behavior:* Spool friction (how hard it is to rewind).
  * *Structure:* Photorealistic cassette tape.
* **Superpower:** This theme is the only one that explicitly links the `currentTime` seeking of an audio file to the velocity of a continuous circular touch-drag gesture.

### 381. The Secret Diary UV Light
* **Purpose:** Hidden data discovery via spotlight mechanic.
* **Category:** Memory Preservation
* **Unique Functionality:** The screen looks like a blank, slightly textured piece of paper. The user drags a glowing purple circle ("UV Light") around the screen. Only the text that falls directly underneath the purple circle becomes visible (like invisible ink).
* **Interaction Model:** Proximity-based masking.
* **Structural Layout:** A dark text layer masked by `clip-path: circle()`. The center coordinates of the `clip-path` are dynamically bound to the user's `touchmove` or `mousemove` coordinates.
* **Editor Customization Options:**
  * *Content:* The secret diary entries.
  * *Behavior:* Size of the UV light.
  * *Structure:* Glowing, neon-purple UI aesthetic.
* **Superpower:** This theme is the only one that uses a dynamic `clip-path` bound to cursor/touch coordinates to selectively reveal hidden text beneath it.

### 382. The Associative Memory Match (Concentration)
* **Purpose:** Gamifying the connection between objects and people.
* **Category:** Memory Preservation
* **Unique Functionality:** A classic 4x4 card-matching game. But instead of matching two identical pictures, the user must match a person (e.g., Mom) with an object they love (e.g., Coffee Mug). If they make the correct associative match, the pair disappears and reveals a specific written memory about Mom and coffee.
* **Interaction Model:** Associative logic gating array reveals.
* **Structural Layout:** A grid of cards with a state manager. Selecting two cards evaluates `CardA.matchId === CardB.matchId`. If true, both DOM elements are removed, exposing the underlying text div.
* **Editor Customization Options:**
  * *Content:* The pairs (Person + Object) and the hidden text.
  * *Behavior:* Number of cards.
  * *Structure:* Playing card aesthetic.
* **Superpower:** This theme is the only one that uses a classic memory-matching mechanic to enforce associative logic (matching disparate items) to unlock text data.

### 383. The Heartbeat Sculpture
* **Purpose:** Biometric data as permanent art.
* **Category:** Memory Preservation
* **Unique Functionality:** The user holds their thumb on the screen to record their resting heart rate. The app takes the rhythm and frequency of the taps and uses it to generate a permanent, 3D pulsating sculpture (like a twisting abstract torus). It loops forever, saving their exact biometric rhythm from that day as a visual object.
* **Interaction Model:** Translating tap-rhythm into continuous 3D mesh animation variables.
* **Structural Layout:** An array of time-deltas captured via tapping, passed as uniform variables to a WebGL shader that alters the vertices of a 3D mesh in a continuous loop based on those timings.
* **Editor Customization Options:**
  * *Content:* The date the heartbeat was recorded.
  * *Behavior:* Required recording duration.
  * *Structure:* The 3D base shape (sphere, torus, liquid blob).
* **Superpower:** This theme is the only one that records the rhythm of a user's taps specifically to dictate the continuous vertex-deformation loop of a 3D mesh.

### 384. The Reconstructed Text Message
* **Purpose:** Rebuilding history through effort.
* **Category:** Memory Preservation
* **Unique Functionality:** A pivotal memory (e.g., the very first text message sent to a partner). However, the text is scrambled into a giant pile of individual draggable letters at the bottom of the screen. The user must drag and drop the letters into the empty slots at the top to reconstruct the exact message.
* **Interaction Model:** Drag-and-drop string reconstruction.
* **Structural Layout:** A target string split into a character array. Each character is rendered as a draggable absolute-positioned element that must intersect with specific target droppable zones to validate.
* **Editor Customization Options:**
  * *Content:* The historic text message.
  * *Behavior:* Provide hints? Show the outline of the letters?
  * *Structure:* iMessage bubble aesthetic.
* **Superpower:** This theme is the only one that breaks a single text string into individually draggable characters that must be physically dragged into a specific sequence to reconstruct the string.

### 385. The Cloud Shape Finder
* **Purpose:** Imposing narrative onto abstract visuals.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads a photo of a cloudy sky from a specific memorable day. The app slowly draws animated white outlines over the clouds, turning them into shapes (e.g., a dog, a car) that relate to a story written below. "Remember when we thought that cloud looked like a bear?"
* **Interaction Model:** SVG path animation overlaid on static imagery.
* **Structural Layout:** A background image overlaid with an inline SVG. The `<path>` elements have `stroke-dasharray` and `stroke-dashoffset` CSS animations triggered on scroll to simulate drawing the shapes.
* **Editor Customization Options:**
  * *Content:* The sky photo, the story.
  * *Behavior:* Drawing speed.
  * *Structure:* Hand-drawn, sketchy white SVG lines.
* **Superpower:** This theme is the only one that uses CSS stroke animations to draw specific SVG shapes over a user-uploaded image to visually enforce a narrative association.

### 386. The Artifact Museum (3D Carousel)
* **Purpose:** High-fidelity spatial browsing.
* **Category:** Memory Preservation
* **Unique Functionality:** A 3D museum gallery. Instead of scrolling a list, the user swipes left/right to move the camera between physical marble pedestals. On each pedestal sits a 3D model (e.g., a scanned childhood toy, a wedding ring). Tapping the pedestal placard brings up the text memory.
* **Interaction Model:** 1D swiping driving 3D camera translation.
* **Structural Layout:** A Three.js scene containing multiple spaced-out meshes. A swipe event triggers a camera Tween (easing animation) to translate the camera's X/Z coordinates to focus on the next mesh in the array.
* **Editor Customization Options:**
  * *Content:* The 3D artifacts, the placard text.
  * *Behavior:* Swipe sensitivity.
  * *Structure:* Museum aesthetic (spotlights, marble, shadows).
* **Superpower:** This theme is the only one that translates standard 1D mobile swiping into the physical X/Z axis translation of a camera moving between distinct 3D objects in a virtual space.

### 387. The Sibling Height Race (Line Graph)
* **Purpose:** Gamifying chronological data comparison.
* **Category:** Memory Preservation
* **Unique Functionality:** A line graph tracking the heights of 3 siblings from age 0 to 18. Instead of a static chart, it animates over time like a race. The lines crawl forward year by year, crossing over each other (as one sibling hits a growth spurt and passes the older one), ending at their final adult heights.
* **Interaction Model:** Animated multi-variable chronological plotting.
* **Structural Layout:** A charting library (like Chart.js) or custom SVG where the X-axis (Time) animates forward, progressively drawing three separate Y-axis (Height) data arrays simultaneously.
* **Editor Customization Options:**
  * *Content:* The sibling names and height datasets.
  * *Behavior:* Animation speed.
  * *Structure:* Colorful, playful race-track aesthetic.
* **Superpower:** This theme is the only one designed specifically to animate the drawing of multiple line-graph datasets simultaneously to visualize the historical crossover points (growth spurts) of the data.

### 388. The Audio Guestbook (Rotary Dialer)
* **Purpose:** Skeuomorphic acoustic collection.
* **Category:** Memory Preservation
* **Unique Functionality:** The UI is a photorealistic rotary phone. The user must drag their finger in a circle to "dial" a 7-digit number. Once dialed, it rings, plays an outgoing voicemail greeting, and opens the microphone for the user to leave a voice note for the host (e.g., a wedding guestbook).
* **Interaction Model:** Complex rotational validation gating audio recording.
* **Structural Layout:** A rotational drag listener that must execute 7 distinct, sequential angular-drag-and-release events to match a target array, which then triggers the `MediaRecorder` API.
* **Editor Customization Options:**
  * *Content:* The target phone number, the host's outgoing greeting.
  * *Behavior:* Dialing friction and snap-back speed.
  * *Structure:* Vintage rotary phone visual.
* **Superpower:** This theme is the only one that requires 7 sequential rotational drag-and-release gestures (dialing) to validate access to the microphone recording API.

### 389. The Map Route Replayer
* **Purpose:** Spatial and chronological playback of a journey.
* **Category:** Memory Preservation
* **Unique Functionality:** A map showing a road trip route. The user presses "Play." A tiny car icon physically drives along the drawn route on the map. When the car hits specific GPS coordinates, it pauses, pops open a photo taken at that exact location, waits 3 seconds, and continues driving.
* **Interaction Model:** Automated spatial traversal triggering intersection events.
* **Structural Layout:** An icon interpolating along an array of Lat/Lng coordinates. An intersection observer (or coordinate matcher) checks if the current position matches a photo-node, triggering a modal pop-up and pausing the traversal loop.
* **Editor Customization Options:**
  * *Content:* The route coordinates, the photos.
  * *Behavior:* Driving speed.
  * *Structure:* Top-down map aesthetic (satellite, illustrated).
* **Superpower:** This theme is the only one that animates an icon along a geographical route specifically to trigger timed pop-ups upon intersecting with predefined GPS coordinate nodes.

### 390. The Vinyl Crate Digger
* **Purpose:** Rapid physical browsing of large datasets.
* **Category:** Memory Preservation
* **Unique Functionality:** A top-down view of a milk crate full of vinyl records. The user swipes rapidly upward to flip through the records (they flip forward physically in 3D). They stop on one, tap it to pull it completely out of the crate, and read the "liner notes" (the memory) written on the back cover.
* **Interaction Model:** High-speed 1D swiping driving 3D rotational arrays.
* **Structural Layout:** An array of flat div elements. Swiping up iterates a counter, applying a `transform: rotateX(80deg)` to previous indexes, simulating the physical flipping of records in a tight box.
* **Editor Customization Options:**
  * *Content:* The album covers and liner notes.
  * *Behavior:* Friction (how many records flip per swipe).
  * *Structure:* Record store crate aesthetic.
* **Superpower:** This theme is the only one that uses rapid Y-axis swiping to sequentially trigger the X-axis rotation of a tight array of DOM elements, simulating flipping through a physical stack.

### 391. The Mechanical Slide Projector
* **Purpose:** Forcing a slow, deliberate pacing mechanism.
* **Category:** Memory Preservation
* **Unique Functionality:** To view the next photo in an album, the user must press a heavy, mechanical UI button. The screen goes black, a loud CLUNK sound plays, and the new photo drops down from the top of the screen, settling with a slight bounce. Dust particles float in a simulated projector beam.
* **Interaction Model:** Over-engineered interstitial transitions.
* **Structural Layout:** A button click that triggers a mandatory 1-second blackout interstitial, followed by a CSS `translateY` drop animation with a custom `cubic-bezier` bounce easing, paired with heavy mechanical audio nodes.
* **Editor Customization Options:**
  * *Content:* The photo slides.
  * *Behavior:* Required wait time between slides.
  * *Structure:* Retro 1970s living room aesthetic.
* **Superpower:** This theme is the only one that deliberately interrupts array navigation with a slow, blackout interstitial and a bouncing drop-animation to simulate analog mechanical hardware.

### 392. The View-Master (Stereoscopic 3D)
* **Purpose:** Immersive, binocular-style viewing.
* **Category:** Memory Preservation
* **Unique Functionality:** The screen is masked by two circles (like binoculars). It displays a stereoscopic image (two slightly offset photos). If the user crosses their eyes (or uses a cheap VR headset/Google Cardboard), the image pops into true 3D. Tapping a heavy lever on the side rotates the disc to the next image.
* **Interaction Model:** Dual-canvas rendering for stereoscopic vision.
* **Structural Layout:** The viewport is split into two halves. The same image is rendered in both halves but with a slight, calculated X-axis horizontal offset to trick the human brain into perceiving depth.
* **Editor Customization Options:**
  * *Content:* The stereoscopic image pairs.
  * *Behavior:* Click to advance.
  * *Structure:* Red plastic View-Master aesthetic.
* **Superpower:** This theme is the only one that splits the viewport to render two slightly horizontally-offset versions of the same image to force a stereoscopic 3D optical illusion.

### 393. The Sandbox Archeologist (Digging)
* **Purpose:** Frantic subtractive labor to beat a timer.
* **Category:** Memory Preservation
* **Unique Functionality:** The screen is completely covered in digital sand. A timer starts (e.g., 10 seconds). The user must rapidly tap and swipe the screen to "dig." Swiping removes chunks of sand. They must unearth the buried time capsule (a hidden div) before the timer runs out, or the sand resets.
* **Interaction Model:** Rapid subtractive masking against a countdown.
* **Structural Layout:** A canvas masking layer where rapid touch events erase large radii of the canvas. If the `IntersectionObserver` doesn't detect the fully exposed underlying div before `setTimeout` fires, the canvas refills.
* **Editor Customization Options:**
  * *Content:* The buried object and text.
  * *Behavior:* Timer duration, brush size (difficulty).
  * *Structure:* Sand texture.
* **Superpower:** This theme is the only one that combines a rapid subtractive canvas-erasing mechanic with a strict failure-state countdown timer.

### 394. The Scent Associator (Color Mixing)
* **Purpose:** Translating abstract memory into visual synthesis.
* **Category:** Memory Preservation
* **Unique Functionality:** The user is asked to remember a specific smell (e.g., "Grandma's perfume"). They are given 3 color sliders (Red, Blue, Yellow). They must mix the sliders to create a custom color that they feel *represents* that smell. The app saves that exact hex code and attaches their written memory to it.
* **Interaction Model:** Multi-variable input mapping to a unified hex string.
* **Structural Layout:** Three range sliders (0-255) that dynamically update the `background-color` of a central div using `rgb(r, g, b)`. Submitting the form saves the computed hex code alongside the text payload.
* **Editor Customization Options:**
  * *Content:* The memory prompt.
  * *Behavior:* Add CMYK vs RGB mixing.
  * *Structure:* Paint palette aesthetic.
* **Superpower:** This theme is the only one designed to require the user to manually mix an RGB value via sliders to visually define an associative memory before saving the data.

### 395. The Constellation Connect (Custom Sky Map)
* **Purpose:** Personalized, permanent geometric generation.
* **Category:** Memory Preservation
* **Unique Functionality:** The user is presented with a blank night sky. They are asked to plot 5 to 10 dots anywhere on the screen. The app then automatically draws glowing lines connecting the dots, forming a completely unique geometric constellation. The user names the constellation after a memory, permanently adding it to their sky.
* **Interaction Model:** User-defined coordinate plotting driving automated path generation.
* **Structural Layout:** Capturing an array of X/Y click coordinates on an SVG canvas, then generating a `<polyline>` or `<path>` that connects the indexes of the array in sequence.
* **Editor Customization Options:**
  * *Content:* The constellation names and stories.
  * *Behavior:* Line drawing animation speed.
  * *Structure:* Deep space aesthetic.
* **Superpower:** This theme is the only one that captures freeform user clicks to generate a custom array of X/Y coordinates, which is then permanently connected via SVG paths to form a unique geometric shape.

### 396. The Water Droplet Merger
* **Purpose:** Gyroscopic physical puzzle resolving in connection.
* **Category:** Memory Preservation
* **Unique Functionality:** Two distinct water droplets sit on the screen. The user must tilt their phone physically using the gyroscope to roll the droplets around. The goal is to roll them into each other. When they collide, they merge into one larger droplet, unlocking a shared memory.
* **Interaction Model:** Gyroscopic 2D physics puzzle.
* **Structural Layout:** Two physics bodies (Matter.js) with high friction, affected by gravity vectors pulled from the `DeviceOrientationEvent`. A collision event listener triggers the merge animation and the data reveal.
* **Editor Customization Options:**
  * *Content:* The shared memory.
  * *Behavior:* Liquid viscosity (how fast they roll).
  * *Structure:* Photorealistic glass/water aesthetic.
* **Superpower:** This theme is the only one that uses device gyroscopic gravity to force the user to physically steer two independent 2D physics bodies into a collision state.

### 397. The Audio Waveform Engraver
* **Purpose:** Visualizing sound as physical destruction.
* **Category:** Memory Preservation
* **Unique Functionality:** The user uploads a short audio clip (e.g., a baby's first laugh). The app extracts the waveform. A digital "laser" then appears and slowly moves across a block of digital wood, burning the exact shape of that waveform into the wood, leaving a permanent visual artifact.
* **Interaction Model:** Audio analysis driving a slow-rendering visual path.
* **Structural Layout:** Extracting an array of amplitude peaks from an audio file, plotting them as X/Y coordinates, and animating a glowing CSS particle (the laser) along those coordinates while drawing a dark SVG path behind it.
* **Editor Customization Options:**
  * *Content:* The audio file.
  * *Behavior:* Engraving speed.
  * *Structure:* Woodblock, metal, or stone aesthetic.
* **Superpower:** This theme is the only one that translates audio amplitude peaks into a sequential pathing animation designed to simulate a laser physically engraving a material.

### 398. The Sibling Rivalry Scoreboard
* **Purpose:** Institutionalizing petty, long-term data.
* **Category:** Memory Preservation
* **Unique Functionality:** A massive, stadium-style Jumbotron. It tracks a single, petty rivalry over a decade (e.g., "Mario Kart Wins"). It shows the all-time score: 452 to 411. Users can press a massive button to add +1 to their score, complete with stadium airhorns and flashing lights.
* **Interaction Model:** Macro-scale integer incrementation with aggressive feedback.
* **Structural Layout:** A simple `+1` database incrementer, but wrapped in a massive, CSS-heavy UI utilizing flashing `text-shadow` neon effects and loud audio API triggers on every click.
* **Editor Customization Options:**
  * *Content:* The rivalry being tracked.
  * *Behavior:* Can you subtract a point? (No).
  * *Structure:* Stadium Jumbotron aesthetic.
* **Superpower:** This theme is the only one that elevates a simple `count++` function into a massive, aggressive, stadium-themed audiovisual spectacle.

### 399. The Chaotic Group Chat Simulator
* **Purpose:** Recreating the anxiety and humor of digital noise.
* **Category:** Memory Preservation
* **Unique Functionality:** A fake group chat interface. The user presses a "Next" button. Instantly, 5 different "family members" start typing at once. Texts fly in overlapping, out of order, scrolling the screen aggressively, perfectly simulating the chaos of a family trying to plan Thanksgiving dinner.
* **Interaction Model:** Automated, multi-threaded DOM injection mimicking human pacing.
* **Structural Layout:** An array of message objects executed by 5 distinct, simultaneous `setInterval` loops with randomized delays, aggressively pushing to a single auto-scrolling flexbox container.
* **Editor Customization Options:**
  * *Content:* The chaotic script.
  * *Behavior:* Typing speed, notification sound spam.
  * *Structure:* iMessage/WhatsApp aesthetic.
* **Superpower:** This theme is the only one designed specifically to overwhelm the user by executing multiple asynchronous text-injection loops simultaneously to simulate chaotic human communication.

### 400. The Memory Erase (Black Hole)
* **Purpose:** A definitive, philosophical act of deletion.
* **Category:** Memory Preservation
* **Unique Functionality:** The user types a memory they want to forget forever. They must press and hold a button for 10 seconds. The screen vibrates violently. The text is sucked into a visual black hole in the center of the screen, distorting as it goes. The server permanently deletes the text, leaving a blank, peaceful white screen.
* **Interaction Model:** Sustained input driving visual distortion and permanent data destruction.
* **Structural Layout:** A touch-hold listener mapping to a CSS `scale` and `filter: swirl/distort` on the text node, culminating in a `DELETE` API call that wipes the database record.
* **Editor Customization Options:**
  * *Content:* The memory to destroy.
  * *Behavior:* Hold duration (make it difficult).
  * *Structure:* Pitch black gravity well aesthetic.
* **Superpower:** This theme is the only one that uses a sustained touch-hold interaction to trigger a visual gravity distortion effect, culminating in the permanent deletion of the application's own data.
