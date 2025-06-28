import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Инициализация Prisma
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Создание директории data если её нет
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен доступа не предоставлен' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

// 12 основных разделов для самопознания
const defaultSections = [
    { name: 'Базовая информация', description: 'Основные данные о себе, биография, ключевые факты', order: 1 },
    { name: 'История жизни', description: 'Важные события, этапы, переломные моменты', order: 2 },
    { name: 'Личность', description: 'Характер, темперамент, особенности поведения', order: 3 },
    { name: 'Ценности и взгляды', description: 'Мировоззрение, принципы, убеждения', order: 4 },
    { name: 'Тело и здоровье', description: 'Физическое состояние, самочувствие, здоровые привычки', order: 5 },
    { name: 'Социальная жизнь', description: 'Отношения, коммуникация, социальные роли', order: 6 },
    { name: 'Интересы и творчество', description: 'Хобби, увлечения, творческие проявления', order: 7 },
    { name: 'Разум и мотивация', description: 'Мышление, обучение, стремления', order: 8 },
    { name: 'Цели и мечты', description: 'Планы, амбиции, желания', order: 9 },
    { name: 'Теневая сторона', description: 'Страхи, слабости, проблемы', order: 10 },
    { name: 'Отношения с собой', description: 'Самооценка, внутренний диалог, самопринятие', order: 11 },
    { name: 'Рефлексия и изменения', description: 'Осознания, выводы, личностный рост', order: 12 }
];

// Инициализация данных
async function initializeApp() {
    try {
        // Проверяем, есть ли пользователь
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            // Создаем пользователя с дефолтным паролем "password"
            const hashedPassword = await bcrypt.hash('password', 10);
            await prisma.user.create({
                data: {
                    passwordHash: hashedPassword
                }
            });
            console.log('Создан пользователь с паролем: password');
        }

        // Создаем основные разделы, если их нет
        for (const section of defaultSections) {
            await prisma.section.upsert({
                where: { name: section.name },
                update: {},
                create: section
            });
        }

        console.log('Инициализация завершена');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
}

// === AUTH ROUTES ===

// Авторизация
app.post('/api/auth/login', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Пароль обязателен' });
        }

        const user = await prisma.user.findFirst();
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Смена пароля
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Текущий и новый пароли обязательны' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный текущий пароль' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { passwordHash: hashedPassword }
        });

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === SECTIONS ROUTES ===

// Получить все разделы
app.get('/api/sections', authenticateToken, async (req, res) => {
    try {
        const sections = await prisma.section.findMany({
            orderBy: { order: 'asc' },
            include: {
                subtopics: {
                    orderBy: { createdAt: 'asc' }
                },
                _count: {
                    select: { entries: true }
                }
            }
        });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === SUBTOPICS ROUTES ===

// Создать подтему
app.post('/api/subtopics', authenticateToken, async (req, res) => {
    try {
        const { name, description, sectionId } = req.body;
        const subtopic = await prisma.subtopic.create({
            data: { name, description, sectionId: parseInt(sectionId) }
        });
        res.json(subtopic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновить подтему
app.put('/api/subtopics/:id', authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;
        const subtopic = await prisma.subtopic.update({
            where: { id: parseInt(req.params.id) },
            data: { name, description }
        });
        res.json(subtopic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удалить подтему
app.delete('/api/subtopics/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.subtopic.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Подтема удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === ENTRIES ROUTES ===

// Получить записи с фильтрацией
app.get('/api/entries', authenticateToken, async (req, res) => {
    try {
        const { sectionId, subtopicId, tagId, mood, search, page = 1, limit = 20 } = req.query;

        const where = {};
        
        if (sectionId) where.sectionId = parseInt(sectionId);
        if (subtopicId) where.subtopicId = parseInt(subtopicId);
        if (mood) where.mood = mood;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } }
            ];
        }
        if (tagId) {
            where.tags = {
                some: { tagId: parseInt(tagId) }
            };
        }

        const entries = await prisma.entry.findMany({
            where,
            include: {
                section: true,
                subtopic: true,
                tags: {
                    include: { tag: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const total = await prisma.entry.count({ where });

        res.json({
            entries,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получить запись по ID
app.get('/api/entries/:id', authenticateToken, async (req, res) => {
    try {
        const entry = await prisma.entry.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                section: true,
                subtopic: true,
                tags: { include: { tag: true } },
                answers: { include: { prompt: true } }
            }
        });
        res.json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создать запись
app.post('/api/entries', authenticateToken, async (req, res) => {
    try {
        const { title, content, mood, intensity, sectionId, subtopicId, tagIds, isDraft } = req.body;
        
        const entry = await prisma.entry.create({
            data: {
                title,
                content,
                mood,
                intensity: intensity ? parseInt(intensity) : null,
                sectionId: parseInt(sectionId),
                subtopicId: subtopicId ? parseInt(subtopicId) : null,
                isDraft: isDraft || false
            }
        });

        // Добавляем теги если есть
        if (tagIds && tagIds.length > 0) {
            await prisma.entryTag.createMany({
                data: tagIds.map(tagId => ({
                    entryId: entry.id,
                    tagId: parseInt(tagId)
                }))
            });
        }

        const fullEntry = await prisma.entry.findUnique({
            where: { id: entry.id },
            include: {
                section: true,
                subtopic: true,
                tags: { include: { tag: true } }
            }
        });

        res.json(fullEntry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Обновить запись
app.put('/api/entries/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, mood, intensity, sectionId, subtopicId, tagIds, isDraft } = req.body;
        
        // Обновляем запись
        const entry = await prisma.entry.update({
            where: { id: parseInt(req.params.id) },
            data: {
                title,
                content,
                mood,
                intensity: intensity ? parseInt(intensity) : null,
                sectionId: parseInt(sectionId),
                subtopicId: subtopicId ? parseInt(subtopicId) : null,
                isDraft: isDraft || false
            }
        });

        // Обновляем теги
        await prisma.entryTag.deleteMany({
            where: { entryId: entry.id }
        });

        if (tagIds && tagIds.length > 0) {
            await prisma.entryTag.createMany({
                data: tagIds.map(tagId => ({
                    entryId: entry.id,
                    tagId: parseInt(tagId)
                }))
            });
        }

        const fullEntry = await prisma.entry.findUnique({
            where: { id: entry.id },
            include: {
                section: true,
                subtopic: true,
                tags: { include: { tag: true } }
            }
        });

        res.json(fullEntry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Удалить запись
app.delete('/api/entries/:id', authenticateToken, async (req, res) => {
    try {
        await prisma.entry.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Запись удалена' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === TAGS ROUTES ===

// Получить все теги
app.get('/api/tags', authenticateToken, async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { entries: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Создать тег
app.post('/api/tags', authenticateToken, async (req, res) => {
    try {
        const { name, color } = req.body;
        const tag = await prisma.tag.create({
            data: { name, color }
        });
        res.json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === EXPORT/IMPORT ROUTES ===

// Экспорт всех данных
app.get('/api/export', authenticateToken, async (req, res) => {
    try {
        const sections = await prisma.section.findMany({
            include: {
                subtopics: true,
                entries: {
                    include: {
                        tags: { include: { tag: true } },
                        answers: { include: { prompt: true } }
                    }
                }
            }
        });

        const tags = await prisma.tag.findMany();
        const prompts = await prisma.prompt.findMany();

        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            sections,
            tags,
            prompts
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=reflection-diary-backup.json');
        res.json(exportData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Импорт данных
app.post('/api/import', authenticateToken, async (req, res) => {
    try {
        const { data } = req.body;
        
        if (!data || !data.sections) {
            return res.status(400).json({ error: 'Неверный формат данных' });
        }

        // Импорт тегов
        if (data.tags) {
            for (const tag of data.tags) {
                await prisma.tag.upsert({
                    where: { name: tag.name },
                    update: { color: tag.color },
                    create: { name: tag.name, color: tag.color }
                });
            }
        }

        // Импорт разделов и записей
        for (const section of data.sections) {
            const existingSection = await prisma.section.findUnique({
                where: { name: section.name }
            });

            if (existingSection && section.entries) {
                // Импорт записей в существующий раздел
                for (const entry of section.entries) {
                    await prisma.entry.create({
                        data: {
                            title: entry.title,
                            content: entry.content,
                            mood: entry.mood,
                            intensity: entry.intensity,
                            isDraft: entry.isDraft,
                            sectionId: existingSection.id,
                            createdAt: new Date(entry.createdAt),
                            updatedAt: new Date(entry.updatedAt)
                        }
                    });
                }
            }
        }

        res.json({ message: 'Данные успешно импортированы' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, async () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    await initializeApp();
});

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
}); 