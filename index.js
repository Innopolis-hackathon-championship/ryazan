const productsDB = {
    1: { name: '1', price: 10, quantity: 5 },
    2: { name: '2', price: 20, quantity: 3 },
    3: { name: '3', price: 30, quantity: 8 },
    4: { name: '4', price: 40, quantity: 2 },
    5: { name: '5', price: 50, quantity: 5 },
    6: { name: '6', price: 60, quantity: 4 },
    7: { name: '7', price: 70, quantity: 6 },
    8: { name: '8', price: 80, quantity: 7 },
};
const QRCode = require('qrcode');
arr = [5,3,3,2,4,4,6,7];
let ratings = [];

const usersDB = {
    '5441406901': { balance: 200 },
    '1011516006': { balance: 200 },
    '1394477724': { balance: 200 },
    '137856067':{ balance: 200 },
    '2143638774':{ balance: 200 }
};
const TelegramBot = require('node-telegram-bot-api');

const token = '6542715904:AAEV5mo9FZvSzUAAU9uI6cjJEPWrXE9MG0k';
const whitelist = new Set(['5441406901', '1011516006','1394477724','137856067','2143638774']);

const bot = new TelegramBot(token, { polling: true });

let cart = [];

const mainMenu = {
    reply_markup: {
        keyboard: [['📝 Меню', '🛒 Корзина']],
        resize_keyboard: true,
    },
};

const ratingKeyboard = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "1", callback_data: "1" }, { text: "2", callback_data: "2" }],
            [{ text: "3", callback_data: "3" }, { text: "4", callback_data: "4" }],
            [{ text: "5", callback_data: "5" }]
        ]
    }
};

const productMenu = {
    reply_markup: {
        keyboard: [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '🛒 Корзина'],
            ['⬅️ Назад']
        ],
        resize_keyboard: true,
    },
};
const Last = {
    reply_markup: {
        keyboard: [
            ['⬅️ Назад']
        ],
        resize_keyboard: true,
    },
};
const checkoutMenu = {
    reply_markup: {
        keyboard: [
            ['🚴 Доставка курьером', '🚗 Самовывоз'],
            ['⬅️ Назад']
        ],
        resize_keyboard: true,
    },
};

const removeItemMenu = {
    reply_markup: {
        keyboard: [
            ['Удалить товар', '⬅️ Назад']
        ],
        resize_keyboard: true,
    },
};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (whitelist.has(chatId.toString())) {
        bot.sendPhoto(chatId, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPYe7EHqRXZrcpS8TL0dbH6Y3JCW8xtDUQmA&usqp=CAU')
        bot.sendMessage(chatId, 'Добро пожаловать! Вы авторизованы.', mainMenu);
    } else {
        bot.sendMessage(chatId, 'Извините, вы не авторизованы для использования этого бота.');
    }
});
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!whitelist.has(chatId.toString())) {
        bot.sendMessage(chatId, 'Извините, вы не авторизованы для использования этого бота.');
    } else {
        switch (msg.text) {
            case '📝 Меню':
                bot.sendMessage(chatId,`1️⃣ Сосиска в тесте 30 руб (${arr[0]} осталось)
2️⃣ Ватрушка с творогом 30 руб (${arr[1]} осталось)
3️⃣ Пицца 50 руб (${arr[2]} осталось)
4️⃣ Булочка с повидлом 25 руб (${arr[3]} осталось)
5️⃣ Булочка с бананом 25 руб (${arr[4]} осталось)
6️⃣ Чай 20 руб (${arr[5]} осталось)
7️⃣ Кофе 30 руб (${arr[6]} осталось)
8️⃣ Сок 25 руб (${arr[7]} осталось)
`)
                bot.sendMessage(chatId, 'Пожалуйста, выберите товар из меню:', productMenu);
                break;
            case '🛒 Корзина':
                if (cart.length === 0) {
                    bot.sendMessage(chatId, 'Ваша корзина пуста. Пожалуйста, добавьте товары в корзину.', mainMenu);
                } else {
                    let cartMessage = 'Ваша корзина:\n';
                    let totalPrice = 0;
                    cart.forEach((product, index) => {
                        cartMessage += `${index + 1}. ${product.name} - $${product.price}\n`;
                        totalPrice += product.price;
                    });
                    cartMessage += `Общая сумма: $${totalPrice}\n`;
                    const userId = chatId.toString();
                    if (usersDB[userId] && usersDB[userId].balance >= totalPrice) {
                        cartMessage += '✅️У вас достаточно средств для оплаты. Нажмите "Оплатить" для продолжения.✅️';
                        bot.sendMessage(chatId, cartMessage, {
                            reply_markup: {
                                keyboard: [['Оплатить', 'Удалить товар', '⬅️ Назад']],
                                resize_keyboard: true,
                            },
                        });
                    } else {
                        cartMessage += '❌️Недостаточно средств для оплаты.❌️';
                        bot.sendMessage(chatId, cartMessage, {
                            reply_markup: {
                                keyboard: [['Удалить товар', '⬅️ Назад']],
                                resize_keyboard: true,
                            },
                        })
                    }
                }
                break;
            case '⬅️ Назад':
                bot.sendMessage(chatId, 'Вы вернулись в основное меню', mainMenu);
                break;
            case 'Оплатить':
                bot.sendMessage(chatId, 'Выберите способ доставки:', checkoutMenu);
                break;
            case '🚴 Доставка курьером':
                bot.sendMessage(chatId, 'Вы выбрали доставку курьером. Спасибо за покупку!');
                bot.sendMessage(chatId, "Пожалуйста, оцените наш магазин:", ratingKeyboard);
                bot.on('callback_query', (query) => {
                    const rating = query.data;
                    const chatId = query.message.chat.id;
                    ratings.push(parseInt(rating));
                    bot.sendMessage(chatId, `Спасибо за вашу оценку: ${rating}/5. Оценка сохранена.`,Last);
                });
                while(cart.length > 0)
                    cart.pop();

                break;
            case '🚗 Самовывоз':
                const userId = chatId.toString();
                const codeText = ` Order ID: ${Math.floor(Math.random() * 1000)}`; // Генерация уникального текста для QR-кода
                QRCode.toFile(`qrcodes/${userId}.png`, codeText, {
                    color: {
                        dark: '#000', // Цвет для затемненной области
                        light: '#fff' // Цвет для незатемненной области
                    }
                }, function (err) {
                    if (err) throw err;
                    bot.sendPhoto(chatId, `qrcodes/${userId}.png`, {caption: 'Пожалуйста, предъявите этот QR-код для самовывоза.'});
                });
                bot.sendMessage(chatId, "Пожалуйста, оцените наш магазин:", ratingKeyboard);
                bot.on('callback_query', (query) => {
                    const rating = query.data;
                    const chatId = query.message.chat.id;
                    ratings.push(parseInt(rating));
                    bot.sendMessage(chatId, `Спасибо за вашу оценку: ${rating}/5. Оценка сохранена.`,Last);
                });
                while(cart.length > 0)
                    cart.pop();
                break;

            case 'Удалить товар':
                if (cart.length > 0) {
                    cart.pop();
                    bot.sendMessage(chatId, 'Последний добавленный товар был удален из корзины.', removeItemMenu);
                    let cartMessage = 'Ваша корзина:\n';
                    let totalPrice = 0;
                    cart.forEach((product, index) => {
                        cartMessage += `${index + 1}. ${product.name} - $${product.price}\n`;
                        totalPrice += product.price;
                    });
                } else {
                    bot.sendMessage(chatId, 'Ваша корзина пуста.', mainMenu);
                }
                break;
            default:
                const productId = msg.text.toLowerCase().replace('product ', '');
                if (productsDB[productId] && productsDB[productId].quantity > 0) {
                    if (productsDB[productId].quantity > 0) {
                        const productIndex = cart.findIndex(item => item.id === productId);
                        if (productIndex !== -1) {
                            cart[productIndex].quantity += 1; // Увеличиваем количество товара
                        } else {
                            cart.push({...productsDB[productId], quantity: 1}); // Добавляем новый товар в корзину
                        }
                        productsDB[productId].quantity -= 1; // Уменьшаем количество товара
                        bot.sendMessage(chatId, `Товар "${productsDB[productId].name}" добавлен в корзину.`, productMenu);
                    } else {
                        bot.sendMessage(chatId, `Товар "${productsDB[productId].name}" закончился.`, productMenu);
                    }
                    arr[productId - 1] -= 1;
                } else {
                    //bot.sendMessage(chatId, 'Команда не распознана. Пожалуйста, используйте кнопки меню.', mainMenu);
                }
            }
        }
    });
