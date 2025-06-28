# 📖 Self-Discovery Diary

A local web application for structured self-reflection and personal growth journaling.

## ✨ Features

- **12 Predefined Sections** for comprehensive self-exploration
- **Dynamic Subtopics** - Create custom subtopics for each section
- **Mood Tracking** - Track emotions with intensity levels (1-10)
- **Auto-save** - Never lose your thoughts
- **Data Export/Import** - Backup and restore your journal
- **Dark/Light Theme** - Comfortable writing in any lighting
- **Offline First** - Works completely offline, no internet required
- **Privacy Focused** - All data stays on your computer
- **Russian Interface** - The entire web application interface is in Russian

## 🚀 Quick Start

### Windows
1. Double-click `start.bat`
2. Browser will open automatically at http://localhost:5173
3. Default password: `password`

### Linux/Mac
1. Open terminal in this folder
2. Run: `chmod +x start.sh && ./start.sh`
3. Open browser: http://localhost:5173
4. Default password: `password`

## 📁 Project Structure

```
Reflection/
├── start.bat                    # Windows launcher
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
└── app/                         # Application folder
    ├── src/                     # Frontend source code
    ├── server/                  # Backend API server
    ├── data/                    # SQLite database
    ├── dist/                    # Built frontend
    ├── prisma/                  # Database schema
    ├── public/                  # Static assets
    ├── package.json             # Dependencies
    └── ...config files
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Prisma ORM** with SQLite
- **JWT** authentication
- **bcryptjs** for password hashing

## 📊 The 12 Self-Discovery Sections

1. **Basic Information** - Personal data, biography, key facts
2. **Life History** - Important events, stages, turning points
3. **Personality** - Character, temperament, behavioral patterns
4. **Values & Beliefs** - Worldview, principles, convictions
5. **Body & Health** - Physical condition, wellness, healthy habits
6. **Social Life** - Relationships, communication, social roles
7. **Interests & Creativity** - Hobbies, passions, creative expressions
8. **Mind & Motivation** - Thinking patterns, learning, aspirations
9. **Goals & Dreams** - Plans, ambitions, desires
10. **Shadow Side** - Fears, weaknesses, challenges
11. **Self-Relationship** - Self-esteem, inner dialogue, self-acceptance
12. **Reflection & Growth** - Insights, conclusions, personal development

## 🔧 Requirements

- **Node.js 18+** (automatically checked by start.bat)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Windows/Linux/Mac** operating system

## 💾 Data Management

### Backup Your Data
- Copy the `app/data/` folder to a safe location
- Use the built-in export feature in Settings
- All data is stored locally in SQLite database

### Password Management
- Default password: `password`
- Change it in Settings after first login
- Password is hashed with bcrypt for security

## 🔒 Privacy & Security

- **100% Local** - No data leaves your computer
- **No Analytics** - No tracking or telemetry
- **No Internet Required** - Works completely offline
- **Encrypted Storage** - Passwords are properly hashed
- **Open Source** - You can inspect all code

## 🌐 Deployment Options

### Portable Version
- Copy entire project folder to USB drive
- Run `start.bat` on any Windows computer
- All data travels with you

### Electron App
```bash
cd app
npm install
npm run dist
```

### Web Server
```bash
cd app
npm run build
npm run server
```

## 🐛 Troubleshooting

### Application Won't Start
- Install Node.js from https://nodejs.org/
- Check if ports 3001 and 5173 are free
- Run as administrator if needed

### Database Issues
- Ensure `data/reflection.db` exists
- Check file permissions
- Restart the application

### Browser Won't Open
- Try manually opening http://localhost:5173
- Check if Windows Defender is blocking
- Try a different browser

## 📝 Usage Tips

1. **Start Small** - Begin with one section that interests you most
2. **Be Consistent** - Set aside regular time for reflection
3. **Use Subtopics** - Organize thoughts with custom subtopics
4. **Track Moods** - Monitor emotional patterns over time
5. **Export Regularly** - Keep backups of your insights
6. **Be Honest** - This is your private space for authentic self-reflection

## 🤝 Contributing

This is a personal journaling application designed for individual use. The codebase is structured for easy customization and extension.

## 📄 License

This project is for personal use. All data belongs to the user and stays private.

---

**Note**: The entire web application interface is designed in Russian language for Russian-speaking users, while this documentation is provided in English for broader accessibility. 