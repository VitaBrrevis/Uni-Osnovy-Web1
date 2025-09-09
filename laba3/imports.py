import telebot
from telebot import types
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from openai import OpenAI
from datetime import datetime

BOT_TOKEN = "YOUR TOKEN"
OPENAI_API_KEY = "YOUR TOKEN"
GOOGLE_SHEET_URL = "YOUR TOKEN"

scope = ["https://spreadsheets.google.com/feeds", 
         "https://www.googleapis.com/auth/drive"]

credentials = ServiceAccountCredentials.from_json_keyfile_dict({
    "type": "service_account",
    "project_id": "YOUR TOKEN",
    "private_key_id": "YOUR TOKEN",
    "private_key": "YOUR TOKEN",
    "client_email": "YOUR TOKEN",
    "client_id": "YOUR TOKEN",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "hYOUR TOKEN",
    "universe_domain": "googleapis.com"
    }) 
client = gspread.authorize(credentials)

sheet = client.open_by_url(GOOGLE_SHEET_URL).sheet1

openai_client = OpenAI(api_key=OPENAI_API_KEY)

bot = telebot.TeleBot(BOT_TOKEN)

GROUPS = ["ІП-21", "ІП-22", "ІП-23", "ІП-24", "ІП-25"]