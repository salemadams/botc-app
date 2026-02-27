# Running the App Locally

This guide will get the app running on your phone so you can preview your work.

---

## One-Time Setup

### 1. Install Docker Desktop
Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop). This is the tool that runs the app on your machine without needing to install anything else.

### 2. Install Expo Go on your phone
- **iPhone:** [Download from the App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android:** [Download from the Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 3. Clone the repository
If you haven't already, download the project to your computer. Ask Salem for access and instructions on how to do this.

### 4. Create your environment file
In the project folder, duplicate the file called `.env.docker.example` and rename the copy to `.env`.

Then open `.env` and find this line:
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:4000
```

Replace `YOUR_LOCAL_IP` with your computer's local IP address. To find it:
- **Mac:** Open **Terminal** and run: `ipconfig getifaddr en0`
- **Windows:** Open **Command Prompt** and run: `ipconfig` — look for the **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.50`)
- It will print something like `192.168.1.50` — use that number

Your finished `.env` file should look like:
```
EXPO_PUBLIC_API_URL=http://192.168.1.50:4000
```

> **Note:** Your phone and computer must be connected to the same Wi-Fi network.

---

## Running the App

### 1. Start Docker Desktop
Open Docker Desktop and wait for it to finish loading (the whale icon in your menu bar will stop animating).

### 2. Start the app
Open **Terminal**, navigate to the project folder, and run:
```
docker compose up
```

The first time you run this it will take a few minutes to set everything up. You will see a lot of output — this is normal.

### 3. Scan the QR code
Once you see a QR code appear in the terminal, scan it with your phone:
- **iPhone:** Open the Camera app and point it at the QR code
- **Android:** Open Expo Go and tap "Scan QR code"

The app will open in Expo Go on your phone.

---

## Stopping the App

When you are done, go back to Terminal and press `Control + C`, then run:
```
docker compose down
```

---

## Making Changes

Once the app is running, any changes you save to the project files will automatically appear in the app on your phone within a few seconds — no need to restart anything.

---

## Troubleshooting

**The QR code looks garbled and won't scan**
Open a new Terminal window, navigate to the project folder, and run:
```
docker compose logs -f client
```
This will show the QR code in a format your camera can read.

**"connect_error due to timeout" appears on the phone**
Your IP address may have changed (this happens when you switch Wi-Fi networks). Find your new IP (Mac: `ipconfig getifaddr en0`, Windows: `ipconfig` and look for IPv4 Address), update the `.env` file, then stop and restart the app.

**The app won't load at all**
Make sure Docker Desktop is fully running before you run `docker compose up`.
