const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

const app = express()

dotenv.config()
app.use(express.json())
app.use(cors())

const token = process.env.TELEGRAM

const bot = new TelegramBot(token, { polling: true })

const bootstrap = () => {
  bot.setMyCommands([
    { command: '/start', description: "Kurslar haqida ma'lumot" },
    { command: '/courses', description: 'Barcha kurslar' },
  ])

  bot.on('message', async msg => {
    const chatId = msg.chat.id
    const text = msg.text

    if (text === '/start') {
      await bot.sendMessage(chatId, 'Mening platformanda bor kurslarni sotib olishingiz mumkin.', {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Kurslarni ko'rish",
                web_app: { url: 'https://web-telegram-bot-rho.vercel.app' },
              },
            ],
          ],
        },
      })
    }

    if (text === '/courses') {
      await bot.sendMessage(chatId, 'Mening platformanda bor kurslarni sotib olishingiz mumkin.', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Kurslarni ko'rish",
                web_app: { url: 'https://web-telegram-bot-rho.vercel.app' },
              },
            ],
          ],
        },
      })
    }

    if (msg.web_app_data?.data) {
      try {
        const data = JSON.parse(msg.web_app_data?.data)

        await bot.sendMessage(
          chatId,
          "Bizga ishonch bildirganingiz uchun raxmat, siz sotib olgan kurslarni ro'yxati"
        )

        for (item of data) {
          await bot.sendPhoto(chatId, item.Image, {
            caption: `${item.title} - ${item.quantity}x`,
            caption_entities: '',
          })
          // await bot.sendMessage(chatId, `${item.title} - ${item.quantity}x`)
        }

        await bot.sendMessage(
          chatId,
          `Umumiy narx - ${data
            .reduce((a, c) => a + c.price * c.quantity, 0)
            .toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
        )
      } catch (error) {
        console.log(error)
      }
    }
  })
}

bootstrap()

app.post('/web-data', async (req, res) => {
  const { queryId, products } = req.body
  console.log(req.body)

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Muvaffaqiyatli xariq qildingiz',
      input_message_content: {
        message_text: `Xaridingiz bilan tabriklaymiz, siz ${products
          .reduce((a, c) => a + c.price * c.quantity, 0)
          .toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })} qiymatga ega mahsulot sotib oldingiz ${products
          .map(c => `${c.title} ${c.quantity}x`)
          .join(', ')}`,
      },
    })

    res.status(200).json({})
  } catch (error) {
    return res.status(500).json({})
  }
})

app.listen(process.env.PORT || 5001, () => console.log('Server started'))
