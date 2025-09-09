from imports import *

@bot.message_handler(commands=['start'])
def start_handler(message):
    chat_id = message.chat.id
    records = sheet.get_all_records()

    for row in records:
        if str(row["chat_id"]) == str(chat_id):
            bot.send_message(chat_id, "✅ Ви вже зареєстровані!\n\n"
                                      "Щоб переглянути свої дані — натисніть /me 😉")
            return

    bot.send_message(chat_id, "👋 Вітаю! Давайте зареєструємося у системі.\n\n"
                              "Спочатку оберіть вашу групу 👇")

    markup = types.InlineKeyboardMarkup()
    buttons = [types.InlineKeyboardButton(text=g, callback_data=f"group:{g}") for g in GROUPS]
    for i in range(0, len(buttons), 2):
        markup.row(*buttons[i:i+2])

    bot.send_message(chat_id, "📌 Оберіть вашу групу:", reply_markup=markup)

@bot.callback_query_handler(func=lambda call: call.data.startswith("group:"))
def callback_group(call):
    chat_id = call.message.chat.id
    group = call.data.split(":")[1]

    bot.send_message(chat_id, f"✅ Ви обрали групу: *{group}* 🎓", parse_mode="Markdown")
    msg = bot.send_message(chat_id, "✍️ Введіть ваше ПІБ (Прізвище Ім'я По батькові).\n\n"
                                    "Наприклад: `Іваненко Іван Іванович`", parse_mode="Markdown")
    bot.register_next_step_handler(msg, process_student, chat_id, group)

def process_student(message, chat_id, group):
    student = message.text.strip()
    if len(student.split()) != 3:
        msg = bot.send_message(chat_id, "❌ ПІБ має складатися з трьох слів.\n\n"
                                        "✅ Приклад: `Петренко Олег Сергійович`\n"
                                        "Спробуйте ще раз:", parse_mode="Markdown")
        bot.register_next_step_handler(msg, process_student, chat_id, group)
        return

    msg = bot.send_message(chat_id, "📧 Введіть ваш e-mail.\n\n"
                                    "✅ Приклад: `student@example.com`")
    bot.register_next_step_handler(msg, process_email, chat_id, group, student)

def process_email(message, chat_id, group, student):
    email = message.text.strip()
    if "@" not in email:
        msg = bot.send_message(chat_id, "❌ Це не схоже на e-mail 😅\n\n"
                                        "✅ Приклад: `student@ukr.net`\n"
                                        "Спробуйте ще раз:")
        bot.register_next_step_handler(msg, process_email, chat_id, group, student)
        return

    msg = bot.send_message(chat_id, "📱 Введіть ваш номер телефону у форматі *+380XXXXXXXXX* (13 символів).\n\n"
                                    "✅ Приклад: `+380931234567`", parse_mode="Markdown")
    bot.register_next_step_handler(msg, process_phone, chat_id, group, student, email)

def process_phone(message, chat_id, group, student, email):
    phone = message.text.strip()
    if not (phone.startswith("+380") and phone[1:].isdigit() and len(phone) == 13):
        msg = bot.send_message(chat_id, "❌ Невірний номер телефону 😢\n"
                                        "Він має бути у форматі *+380XXXXXXXXX* та містити рівно 13 символів.\n\n"
                                        "✅ Приклад: `+380671112233`\n"
                                        "Спробуйте ще раз:", parse_mode="Markdown")
        bot.register_next_step_handler(msg, process_phone, chat_id, group, student, email)
        return

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sheet.append_row([now, chat_id, group, student, email, phone, ""])
    bot.send_message(chat_id, "🎉 Ви успішно зареєстровані!\n\n"
                              "Тепер можете подивитися свої дані командою /me 😉")

@bot.message_handler(commands=['me'])
def me_handler(message):
    chat_id = message.chat.id
    records = sheet.get_all_records()

    for row in records:
        if str(row["chat_id"]) == str(chat_id):
            response = (f"📌 *Ваші дані:*\n\n"
                        f"👥 Група: {row['Група']}\n"
                        f"🎓 Студент: {row['Студент']}\n"
                        f"📧 E-mail: {row['e-mail']}\n"
                        f"📱 Номер: {row['Номер']}")
            bot.send_message(chat_id, response, parse_mode="Markdown")
            return

    bot.send_message(chat_id, "ℹ️ Ви ще не зареєстровані. Натисніть /start, щоб почати.")

@bot.message_handler(commands=['promt'])
def promt_handler(message):
    msg = bot.send_message(message.chat.id, "💬 Введіть ваше запитання до ChatGPT.\n\n"
                                            "✅ Наприклад: *Які основні принципи ООП?*", parse_mode="Markdown")
    bot.register_next_step_handler(msg, process_promt)


def process_promt(message):
    chat_id = message.chat.id
    question = message.text
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": question}]
        )
        answer = completion.choices[0].message.content

        records = sheet.get_all_records()
        for row in records:
            if str(row["chat_id"]) == str(chat_id):
                sheet.append_row([now, chat_id, row["Група"], row["Студент"],
                                  row["e-mail"], row["Номер"], f"Q: {question}\nA: {answer}"])
                break

        bot.send_message(chat_id, f"🤖 Відповідь від ChatGPT:\n\n{answer}")
    except Exception as e:
        bot.send_message(chat_id, f"⚠️ Виникла помилка при зверненні до ChatGPT: {e}")

if __name__ == "__main__":
    bot.polling(none_stop=True)
