# 🎙️ Noise Monitoring Service (Raspberry Pi)

This project continuously monitors ambient noise using a connected
microphone on a **Raspberry Pi**.\
When a **peak sound** is detected, it records: - **1 second before** and
**2 seconds after** the noise peak\
- Converts it to **WAV format**\
- Generates a **spectrogram (PNG)** using FFmpeg\
- Sends the result (and noise level in dB) to an **n8n webhook**
endpoint.

------------------------------------------------------------------------

## 🧩 Project Structure

    project-root/
    ├── recordings/             # Generated audio recordings (auto-created, ignored by Git)
    ├── src/
    │   ├── services/
    │   │   └── MicService.ts   # Main recording and monitoring logic
    │   ├── utils/
    │   │   ├── FFmpegUtils.ts  # FFmpeg conversions (raw → wav → spectrogram)
    │   │   └── Logger.ts       # Simple logger utility
    │   └── index.ts            # Entry point to start monitoring
    └── package.json

------------------------------------------------------------------------

## ⚙️ Requirements

### 🖥️ Hardware

-   Raspberry Pi (recommended: 3B, 4, or newer)
-   USB Microphone or sound card (check with `arecord -l`)
-   MicroSD card (8GB+ recommended)
-   Internet connection

### 🧰 Software

-   Node.js **v18+**
-   FFmpeg
-   ALSA (comes preinstalled on Raspberry Pi OS)
-   TypeScript / ts-node (if running source code directly)

------------------------------------------------------------------------

## 📦 Installation (Raspberry Pi)

1.  **Update system packages**

    ``` bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Install dependencies**

    ``` bash
    sudo apt install -y ffmpeg alsa-utils
    ```

3.  **Install Node.js (v18+)**

    ``` bash
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    ```

4.  **Verify versions**

    ``` bash
    node -v
    ffmpeg -version
    arecord -l
    ```

5.  **Clone the repository**

    ``` bash
    git clone <YOUR_REPO_URL>.git
    cd <REPO_NAME>
    ```

6.  **Install project dependencies**

    ``` bash
    npm install
    ```

------------------------------------------------------------------------

## 🎛️ Configuration

If your microphone is not detected automatically, edit the audio device
inside\
`MicService.ts`:

``` ts
const device = "plughw:1,7";
```

To check available devices:

``` bash
arecord -l
```

Look for the correct **card** and **device** numbers, and replace them,
for example:

    plughw:<card>,<device>

------------------------------------------------------------------------

## ▶️ Run the Service

### Option 1: Using ts-node (dev mode)

``` bash
npm run dev
```

### Option 2: Build and run (production)

``` bash
npm run build
node dist/index.js
```

The system will begin continuous monitoring, showing logs such as:

    🎤 Starting noise monitoring...
    Noise level: -35.23 dB
    Noise level: -12.44 dB
    🚨 Peak detected! (-9.55 dB)
    🎬 Recording 2s after peak...
    💾 Clip saved: recordings/clip_2025-10-29_14-25.raw
    🎵 WAV generated: recordings/clip_2025-10-29_14-25.wav
    🌈 Spectrogram generated: recordings/clip_2025-10-29_14-25.png
    ✅ Alert sent to n8n with spectrum: recordings/clip_2025-10-29_14-25.png

------------------------------------------------------------------------

## 📤 Webhook Integration

By default, alerts are sent to the following test endpoint:

``` ts
const url = "https://igorramonf.app.n8n.cloud/webhook-test/8ffb90b2-e20c-417c-b088-dd72af457eb9";
```

Each alert includes: - **Noise level (dB)** - **Timestamp** -
**Spectrogram image (PNG)**

You can replace this URL with your own **n8n webhook** or any REST
endpoint.

------------------------------------------------------------------------

## 🧠 Technical Details

  Parameter           Description                       Default
  ------------------- --------------------------------- ---------
  `ALERT_DB`          dB threshold to trigger a peak    -10 dB
  `RMS_THRESHOLD`     Background noise cutoff           250
  `SAMPLE_RATE`       Audio sample rate                 48 kHz
  `CHANNELS`          Number of audio channels          2
  `PRE_BUFFER_SEC`    Seconds recorded before peak      1
  `POST_BUFFER_SEC`   Seconds recorded after peak       2
  `PEAK_COOLDOWN`     Minimum time between peaks (ms)   2000

------------------------------------------------------------------------

## 🪵 Logs

All system activity is logged via the `Logger` utility with emoji tags:

  Emoji   Meaning
  ------- ---------------------------
  🎤      Monitoring started
  💾      Clip saved
  🎵      WAV generated
  🌈      Spectrogram generated
  🚨      Peak detected
  ✅      Webhook sent successfully
  🛑      Monitoring stopped
  ⚠️      Warnings or errors

------------------------------------------------------------------------

## 🧹 Files Generated

  Type     Example                                  Description
  -------- ---------------------------------------- ----------------
  `.raw`   `recordings/clip_2025-10-29_14-25.raw`   Raw audio data
  `.wav`   `recordings/clip_2025-10-29_14-25.wav`   Converted WAV
  `.png`   `recordings/clip_2025-10-29_14-25.png`   Spectrogram

------------------------------------------------------------------------

## 🧩 Utilities

### FFmpegUtils

Handles file conversion:

``` ts
FFmpegUtils.convertRawToWav(rawFile, wavFile);
FFmpegUtils.generateSpectrogram(wavFile, pngFile);
```

### Logger

Adds color-coded and timestamped logs:

``` ts
Logger.info("message");
Logger.warn("message");
Logger.error("message", err);
```

------------------------------------------------------------------------

## 🧪 Testing

You can trigger a manual loud sound (clap, whistle, etc.) ---\
a new recording and spectrogram should appear under `/recordings`,\
and an alert should be sent to your webhook.

------------------------------------------------------------------------

## 🚀 Next Steps

-   [ ] Replace Raspberry Pi mic capture with ESP32 device
-   [ ] Configure ESP32 to detect audio peaks and record ~3 seconds around each event
-   [ ] Send the raw audio buffer to the Node.js server via HTTP or WebSocket
-   [ ] Extend Node service to receive these audio buffers, save them as .raw, and perform:
        [ ] Conversion to .wav
        [ ] Spectrogram generation
        [ ] Alert notification to n8n
-   [ ] tagging to identify which ESP32 sent the data# noise-monitor-api
