from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import pptx.util as util

GREEN_DARK  = RGBColor(0x1a, 0x6b, 0x3c)
GREEN_MID   = RGBColor(0x27, 0xae, 0x60)
GREEN_LIGHT = RGBColor(0xe8, 0xf5, 0xe9)
WHITE       = RGBColor(0xff, 0xff, 0xff)
DARK        = RGBColor(0x1a, 0x2e, 0x1a)
GOLD        = RGBColor(0xf3, 0x9c, 0x12)
BLUE        = RGBColor(0x29, 0x80, 0xb9)
LIGHT_GRAY  = RGBColor(0xf4, 0xf9, 0xf5)

W = Inches(13.33)
H = Inches(7.5)

def new_prs():
    prs = Presentation()
    prs.slide_width  = W
    prs.slide_height = H
    return prs

def blank(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])  # completely blank

def bg(slide, color):
    from pptx.util import Emu
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color

def box(slide, l, t, w, h, color, alpha=None):
    shape = slide.shapes.add_shape(1, l, t, w, h)  # MSO_SHAPE_TYPE.RECTANGLE=1
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    return shape

def rbox(slide, l, t, w, h, color, radius=Inches(0.15)):
    from pptx.enum.shapes import MSO_SHAPE_TYPE
    shape = slide.shapes.add_shape(5, l, t, w, h)  # rounded rect = 5
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    shape.adjustments[0] = 0.05
    return shape

def txt(slide, text, l, t, w, h, size=24, bold=False, color=WHITE, align=PP_ALIGN.LEFT, wrap=True):
    txb = slide.shapes.add_textbox(l, t, w, h)
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txb

def icon_circle(slide, emoji, l, t, r, bg_color):
    circle = slide.shapes.add_shape(9, l, t, r, r)  # oval=9
    circle.fill.solid()
    circle.fill.fore_color.rgb = bg_color
    circle.line.fill.background()
    # emoji text
    txb = slide.shapes.add_textbox(l, t, r, r)
    tf = txb.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = emoji
    run.font.size = Pt(32)
    return circle

prs = new_prs()

# ─────────────────────────────────────────────
# SLIDE 1 — TITLE
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, GREEN_DARK)

# big green gradient strip (simulate with two rects)
box(s, 0, 0, W, Inches(7.5), GREEN_DARK)
box(s, 0, Inches(5.5), W, Inches(2), RGBColor(0x0f, 0x3d, 0x22))

# decorative circles
for (ex, ey, er, ec) in [
    (Inches(11.5), Inches(-0.5), Inches(3), RGBColor(0x27,0xae,0x60)),
    (Inches(12.5), Inches(5.5),  Inches(2), RGBColor(0x1a,0x5c,0x32)),
    (Inches(-0.5), Inches(5.0),  Inches(2), RGBColor(0x1a,0x5c,0x32)),
]:
    c = s.shapes.add_shape(9, ex, ey, er, er)
    c.fill.solid(); c.fill.fore_color.rgb = ec
    c.line.fill.background()

# leaf icon
txt(s, '🌿', Inches(1), Inches(1), Inches(2), Inches(1.2), size=64, align=PP_ALIGN.LEFT)

# title
txt(s, 'ЭкоПлатформа', Inches(1), Inches(1.8), Inches(11), Inches(1.5),
    size=72, bold=True, color=WHITE, align=PP_ALIGN.LEFT)

# subtitle
txt(s, 'Умная система управления отходами в Центральной Азии',
    Inches(1), Inches(3.1), Inches(9), Inches(0.8),
    size=28, color=RGBColor(0xa8,0xd8,0xb0), align=PP_ALIGN.LEFT)

# badge
badge = rbox(s, Inches(1), Inches(4.1), Inches(3.5), Inches(0.65), GREEN_MID)
txt(s, '🏆  2-е место на экологическом хакатоне',
    Inches(1.1), Inches(4.15), Inches(3.3), Inches(0.55),
    size=14, bold=True, color=WHITE, align=PP_ALIGN.LEFT)

# tagline
txt(s, 'Душанбе · Ташкент · Бишкек · Алматы · Ош',
    Inches(1), Inches(5.0), Inches(10), Inches(0.5),
    size=18, color=RGBColor(0xa8,0xd8,0xb0), align=PP_ALIGN.LEFT)

txt(s, '2026', Inches(10), Inches(6.8), Inches(2.5), Inches(0.5),
    size=18, color=RGBColor(0x7f,0xb8,0x8e), align=PP_ALIGN.RIGHT)

# ─────────────────────────────────────────────
# SLIDE 2 — ПРОБЛЕМА
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)

# header bar
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '🌍  Проблема', Inches(0.5), Inches(0.25), Inches(10), Inches(0.9),
    size=36, bold=True, color=WHITE)

# 4 problem cards
cards = [
    ('🗑️', 'Неконтролируемый\nвывоз мусора', 'Отходы вывозятся без учёта объёма и источника'),
    ('📊', 'Нет данных\nи статистики', 'Города не знают, сколько мусора производят районы'),
    ('💸', 'Низкая\nмотивация граждан', 'Люди не заинтересованы в раздельном сборе отходов'),
    ('🏭', 'Заводы без\nинформации', 'Предприятия не знают состав поступающих отходов'),
]
for i, (em, title, sub) in enumerate(cards):
    cx = Inches(0.4 + i * 3.2)
    card = rbox(s, cx, Inches(1.8), Inches(3.0), Inches(4.5), WHITE)
    card.line.color.rgb = RGBColor(0xcc,0xe5,0xd1)
    card.line.width = util.Pt(1)
    # icon circle
    ic = s.shapes.add_shape(9, cx + Inches(0.9), Inches(2.0), Inches(1.2), Inches(1.2))
    ic.fill.solid(); ic.fill.fore_color.rgb = GREEN_LIGHT
    ic.line.fill.background()
    txt(s, em, cx + Inches(0.9), Inches(2.05), Inches(1.2), Inches(1.1), size=36, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, title, cx + Inches(0.1), Inches(3.4), Inches(2.8), Inches(0.8),
        size=16, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    txt(s, sub, cx + Inches(0.1), Inches(4.25), Inches(2.8), Inches(1.8),
        size=12, color=RGBColor(0x55,0x55,0x55), align=PP_ALIGN.CENTER)

# bottom bar
box(s, 0, Inches(6.8), W, Inches(0.7), GREEN_DARK)
txt(s, 'ЭкоПлатформа решает все эти проблемы через цифровизацию процесса сбора отходов',
    Inches(0.3), Inches(6.82), Inches(12.7), Inches(0.55),
    size=15, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 3 — ДВА РЕШЕНИЯ (обзор)
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '⚡  Два решения одной задачи', Inches(0.5), Inches(0.25), Inches(12), Inches(0.9),
    size=36, bold=True, color=WHITE)

# left card — solution 1
lc = rbox(s, Inches(0.4), Inches(1.6), Inches(5.8), Inches(5.5), WHITE)
lc.line.color.rgb = GREEN_MID; lc.line.width = util.Pt(2)
box(s, Inches(0.4), Inches(1.6), Inches(5.8), Inches(0.7), GREEN_MID)
txt(s, 'РЕШЕНИЕ 1  —  ПРЕМИУМ', Inches(0.5), Inches(1.62), Inches(5.6), Inches(0.65),
    size=14, bold=True, color=WHITE)
txt(s, '🗑️', Inches(2.3), Inches(2.5), Inches(1.5), Inches(1.2), size=56, align=PP_ALIGN.CENTER, color=DARK)
txt(s, 'Умный мусорный бак\nс датчиком веса', Inches(0.6), Inches(3.6), Inches(5.2), Inches(0.8),
    size=18, bold=True, color=DARK, align=PP_ALIGN.CENTER)
txt(s,
    '• Пользователь сканирует QR через приложение\n'
    '• Датчик веса автоматически измеряет кг\n'
    '• Система моментально начисляет бонусы\n'
    '• Требует установки умных баков\n\n'
    '💰 Стоимость: высокая',
    Inches(0.6), Inches(4.4), Inches(5.2), Inches(2.3),
    size=13, color=RGBColor(0x33,0x33,0x33))

# right card — solution 2
rc = rbox(s, Inches(6.9), Inches(1.6), Inches(5.8), Inches(5.5), WHITE)
rc.line.color.rgb = GOLD; rc.line.width = util.Pt(2)
box(s, Inches(6.9), Inches(1.6), Inches(5.8), Inches(0.7), GOLD)
txt(s, 'РЕШЕНИЕ 2  —  ДОСТУПНОЕ', Inches(7.0), Inches(1.62), Inches(5.6), Inches(0.65),
    size=14, bold=True, color=WHITE)
txt(s, '📦', Inches(9.5), Inches(2.5), Inches(1.5), Inches(1.2), size=56, align=PP_ALIGN.CENTER, color=DARK)
txt(s, 'QR-наклейки\nна пакеты мусора', Inches(7.1), Inches(3.6), Inches(5.2), Inches(0.8),
    size=18, bold=True, color=DARK, align=PP_ALIGN.CENTER)
txt(s,
    '• Пользователь клеит QR на пакет с мусором\n'
    '• Выбрасывает в обычный контейнер\n'
    '• Завод сканирует QR при обработке\n'
    '• Система автоматически начисляет бонусы\n\n'
    '💰 Стоимость: доступная',
    Inches(7.1), Inches(4.4), Inches(5.2), Inches(2.3),
    size=13, color=RGBColor(0x33,0x33,0x33))

# VS badge
vs = s.shapes.add_shape(9, Inches(6.1), Inches(3.9), Inches(0.8), Inches(0.8))
vs.fill.solid(); vs.fill.fore_color.rgb = GREEN_DARK; vs.line.fill.background()
txt(s, 'VS', Inches(6.1), Inches(3.92), Inches(0.8), Inches(0.75),
    size=16, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 4 — РЕШЕНИЕ 1 детали
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_MID)
txt(s, '🗑️  Решение 1 — Умный бак с датчиком веса', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

# flow steps
steps = [
    ('📱', '1. Открыть\nприложение', 'Пользователь открывает ЭкоПлатформу на смартфоне'),
    ('📷', '2. Сканировать\nQR на баке', 'Приложение сканирует уникальный QR-код умного контейнера'),
    ('🗑️', '3. Выбросить\nмусор', 'Пользователь опускает пакет в умный контейнер'),
    ('⚖️', '4. Датчик\nвзвешивает', 'Встроенный весовой датчик автоматически фиксирует кг'),
    ('🪙', '5. Бонусы\nначисляются', 'EcoCoins зачисляются моментально на счёт пользователя'),
]
arrow_x = [Inches(0.3), Inches(2.8), Inches(5.3), Inches(7.8), Inches(10.3)]
for i, (em, title, sub) in enumerate(steps):
    cx = arrow_x[i]
    card = rbox(s, cx, Inches(1.7), Inches(2.3), Inches(4.3), WHITE)
    card.line.color.rgb = RGBColor(0x27,0xae,0x60); card.line.width = util.Pt(1.5)
    ic = s.shapes.add_shape(9, cx + Inches(0.55), Inches(1.9), Inches(1.2), Inches(1.2))
    ic.fill.solid(); ic.fill.fore_color.rgb = GREEN_LIGHT; ic.line.fill.background()
    txt(s, em, cx + Inches(0.55), Inches(1.95), Inches(1.2), Inches(1.1), size=32, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, title, cx + Inches(0.1), Inches(3.2), Inches(2.1), Inches(0.7),
        size=14, bold=True, color=DARK, align=PP_ALIGN.CENTER)
    txt(s, sub, cx + Inches(0.1), Inches(3.95), Inches(2.1), Inches(1.8),
        size=11, color=RGBColor(0x44,0x44,0x44), align=PP_ALIGN.CENTER)
    # arrow (except last)
    if i < 4:
        arr = s.shapes.add_shape(13, cx + Inches(2.35), Inches(3.4), Inches(0.4), Inches(0.4))
        arr.fill.solid(); arr.fill.fore_color.rgb = GREEN_MID; arr.line.fill.background()

# benefits
box(s, 0, Inches(6.3), W, Inches(1.2), RGBColor(0xe8,0xf5,0xe9))
benefits = ['⚡ Мгновенные бонусы', '📊 Точный учёт кг', '🌍 Нет фальсификаций', '🏙️ Умный город']
for i, b in enumerate(benefits):
    txt(s, b, Inches(0.3 + i*3.3), Inches(6.4), Inches(3.1), Inches(0.9),
        size=15, bold=True, color=GREEN_DARK, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 5 — РЕШЕНИЕ 2 детали
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GOLD)
txt(s, '📦  Решение 2 — QR-наклейки на пакеты мусора', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

steps2 = [
    ('🪙', '1. Купить\nпакеты', 'Получить пакеты с уникальными QR-наклейками в ЭкоПлатформе или партнёрах'),
    ('📦', '2. Упаковать\nмусор', 'Пользователь упаковывает бытовые отходы в пронумерованный пакет'),
    ('🗑️', '3. Выбросить\nв контейнер', 'Пакет с QR выбрасывается в обычный уличный контейнер'),
    ('🚛', '4. Вывоз\nна завод', 'Коммунальные службы забирают мусор и отвозят на завод'),
    ('📷', '5. Сканирование\nна заводе', 'Работник завода сканирует QR на каждом пакете'),
    ('🪙', '6. Бонусы\nпользователю', 'Система автоматически начисляет EcoCoins владельцу пакета'),
]

for i, (em, title, sub) in enumerate(steps2):
    row = i // 3
    col = i % 3
    cx = Inches(0.4 + col * 4.3)
    cy = Inches(1.7 + row * 2.5)
    card = rbox(s, cx, cy, Inches(4.0), Inches(2.2), WHITE)
    card.line.color.rgb = GOLD; card.line.width = util.Pt(1.5)
    ic = s.shapes.add_shape(9, cx + Inches(0.2), cy + Inches(0.2), Inches(0.8), Inches(0.8))
    ic.fill.solid(); ic.fill.fore_color.rgb = RGBColor(0xff,0xf3,0xcd); ic.line.fill.background()
    txt(s, em, cx + Inches(0.2), cy + Inches(0.22), Inches(0.8), Inches(0.75), size=22, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, title, cx + Inches(1.1), cy + Inches(0.1), Inches(2.8), Inches(0.6),
        size=14, bold=True, color=DARK)
    txt(s, sub, cx + Inches(0.2), cy + Inches(0.75), Inches(3.6), Inches(1.3),
        size=11, color=RGBColor(0x44,0x44,0x44))

# advantage note
box(s, Inches(0.3), Inches(6.85), Inches(12.7), Inches(0.5), RGBColor(0xff,0xf3,0xcd))
txt(s, '✅ Преимущество: не требует дорогостоящих умных баков — работает с существующей инфраструктурой',
    Inches(0.5), Inches(6.87), Inches(12.3), Inches(0.45),
    size=14, bold=True, color=RGBColor(0x7d,0x60,0x08), align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 6 — ПЛАТФОРМА (обзор приложения)
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '📱  Мобильная платформа ЭкоПлатформа', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

tabs = [
    ('📰', 'Новости', 'Экологические новости\nЦентральной Азии\nи достижения'),
    ('🗺️', 'Карта', 'Интерактивная карта\nпунктов приёма отходов\nс маршрутами'),
    ('🌿', 'QR-код', 'Уникальный QR-код\nпользователя для\nидентификации пакетов'),
    ('💬', 'Чаты', 'Жалобы, обращения\nв службы, конкурсы\nгородов'),
    ('👤', 'Профиль', 'Уровни, бонусы,\nEcoCoin, история\nсканирований'),
]

for i, (em, name, desc) in enumerate(tabs):
    cx = Inches(0.4 + i * 2.58)
    # tab icon
    ic = s.shapes.add_shape(9, cx + Inches(0.65), Inches(1.7), Inches(1.2), Inches(1.2))
    ic.fill.solid(); ic.fill.fore_color.rgb = GREEN_LIGHT; ic.line.fill.background()
    txt(s, em, cx + Inches(0.65), Inches(1.75), Inches(1.2), Inches(1.1), size=36, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, name, cx, Inches(3.0), Inches(2.5), Inches(0.5),
        size=15, bold=True, color=GREEN_DARK, align=PP_ALIGN.CENTER)
    card = rbox(s, cx + Inches(0.05), Inches(3.55), Inches(2.4), Inches(2.5), WHITE)
    card.line.color.rgb = RGBColor(0xcc,0xe5,0xd1); card.line.width = util.Pt(1)
    txt(s, desc, cx + Inches(0.15), Inches(3.65), Inches(2.2), Inches(2.3),
        size=12, color=RGBColor(0x33,0x33,0x33), align=PP_ALIGN.CENTER)

# bottom nav mockup
box(s, Inches(1.5), Inches(6.25), Inches(10.3), Inches(0.9), WHITE)
for i, (em, name, _) in enumerate(tabs):
    nx = Inches(1.6 + i * 2.05)
    is_center = (i == 2)
    if is_center:
        nc = s.shapes.add_shape(9, nx, Inches(5.95), Inches(0.8), Inches(0.8))
        nc.fill.solid(); nc.fill.fore_color.rgb = GREEN_DARK; nc.line.fill.background()
        txt(s, em, nx, Inches(5.97), Inches(0.8), Inches(0.76), size=18, align=PP_ALIGN.CENTER, color=WHITE)
    else:
        txt(s, em, nx, Inches(6.28), Inches(0.8), Inches(0.55), size=18, align=PP_ALIGN.CENTER, color=GREEN_DARK)
    txt(s, name, nx - Inches(0.1), Inches(6.82), Inches(1.0), Inches(0.35),
        size=9, color=RGBColor(0x66,0x66,0x66), align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 7 — РЕГИСТРАЦИЯ И QR
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '🔐  Регистрация и уникальный QR-код пользователя', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=28, bold=True, color=WHITE)

# registration steps (left)
reg_steps = [
    ('📞', 'Шаг 1: Номер телефона', '+992 (TJ), +996 (KG), +998 (UZ), +7 (KZ)'),
    ('🔢', 'Шаг 2: SMS-код', 'Демо-код для верификации номера'),
    ('🪪', 'Шаг 3: Паспорт/ID', 'Ввод паспортных данных (DEMO режим)'),
    ('🔑', 'Шаг 4: Пароль', 'Создание пароля для входа в аккаунт'),
]
box(s, Inches(0.3), Inches(1.6), Inches(5.8), Inches(5.0), WHITE)
txt(s, 'Процесс регистрации', Inches(0.5), Inches(1.7), Inches(5.4), Inches(0.5),
    size=16, bold=True, color=GREEN_DARK)
for i, (em, step, desc) in enumerate(reg_steps):
    cy = Inches(2.35 + i * 1.05)
    ic = s.shapes.add_shape(9, Inches(0.5), cy, Inches(0.7), Inches(0.7))
    ic.fill.solid(); ic.fill.fore_color.rgb = GREEN_LIGHT; ic.line.fill.background()
    txt(s, em, Inches(0.5), cy + Inches(0.04), Inches(0.7), Inches(0.65), size=20, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, step, Inches(1.35), cy, Inches(4.5), Inches(0.35), size=13, bold=True, color=DARK)
    txt(s, desc, Inches(1.35), cy + Inches(0.35), Inches(4.5), Inches(0.6), size=11, color=RGBColor(0x55,0x55,0x55))

# DEMO badge
demo = rbox(s, Inches(0.4), Inches(6.1), Inches(2.2), Inches(0.5), RGBColor(0xe7,0x4c,0x3c))
txt(s, '⚠️ DEMO РЕЖИМ', Inches(0.45), Inches(6.13), Inches(2.1), Inches(0.45),
    size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER)

# QR section (right)
box(s, Inches(6.8), Inches(1.6), Inches(6.2), Inches(5.0), WHITE)
txt(s, 'Уникальный QR-код', Inches(7.0), Inches(1.7), Inches(5.8), Inches(0.5),
    size=16, bold=True, color=GREEN_DARK)
# QR visual (simulated with shapes)
qr_l = Inches(9.0); qr_t = Inches(2.1); qr_s = Inches(2.5)
box(s, qr_l, qr_t, qr_s, qr_s, WHITE)
# finder patterns
for (fx, fy, fs) in [(qr_l, qr_t, Inches(0.6)), (qr_l+Inches(1.9), qr_t, Inches(0.6)), (qr_l, qr_t+Inches(1.9), Inches(0.6))]:
    box(s, fx, fy, fs, fs, GREEN_DARK)
    box(s, fx+Inches(0.1), fy+Inches(0.1), fs-Inches(0.2), fs-Inches(0.2), WHITE)
    box(s, fx+Inches(0.2), fy+Inches(0.2), fs-Inches(0.4), fs-Inches(0.4), GREEN_DARK)
# random data dots
import random; random.seed(42)
cell = Inches(0.12)
for r in range(5,14):
    for c in range(5,14):
        if random.random() > 0.5:
            box(s, qr_l + c*cell, qr_t + r*cell, cell*0.9, cell*0.9, GREEN_DARK)
txt(s, '🌿', qr_l+Inches(1.1), qr_t+Inches(1.05), Inches(0.35), Inches(0.35), size=14, color=GREEN_DARK)
# center logo
box(s, qr_l+Inches(1.05), qr_t+Inches(1.0), Inches(0.4), Inches(0.4), WHITE)
txt(s, '🌿', qr_l+Inches(1.07), qr_t+Inches(0.98), Inches(0.36), Inches(0.36), size=12, color=GREEN_DARK, align=PP_ALIGN.CENTER)

qr_feats = [
    '🔑 Уникальный для каждого пользователя',
    '📲 Генерируется прямо в приложении',
    '🖨️ Можно распечатать и наклеить на пакет',
    '🏭 Завод сканирует при обработке',
    '🪙 Бонусы начисляются автоматически',
]
for i, f in enumerate(qr_feats):
    txt(s, f, Inches(7.0), Inches(4.7 + i*0.33), Inches(5.8), Inches(0.32),
        size=12, color=RGBColor(0x33,0x33,0x33))

# ─────────────────────────────────────────────
# SLIDE 8 — КАРТА И МАРШРУТЫ
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '🗺️  Интерактивная карта Душанбе', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

# map mockup (left)
map_box = rbox(s, Inches(0.4), Inches(1.6), Inches(6.5), Inches(5.5), RGBColor(0xd4,0xed,0xda))
map_box.line.color.rgb = GREEN_MID; map_box.line.width = util.Pt(2)

# "streets"
for (ml, mt, mw, mh) in [
    (Inches(0.4), Inches(4.1), Inches(6.5), Inches(0.08)),   # horizontal
    (Inches(0.4), Inches(2.8), Inches(6.5), Inches(0.08)),   # horizontal
    (Inches(2.8), Inches(1.6), Inches(0.08), Inches(5.5)),   # vertical
    (Inches(4.5), Inches(1.6), Inches(0.08), Inches(5.5)),   # vertical
]:
    box(s, ml, mt, mw, mh, RGBColor(0xff,0xff,0xff))

# river
river = s.shapes.add_shape(9, Inches(5.8), Inches(1.6), Inches(0.6), Inches(5.5))
river.fill.solid(); river.fill.fore_color.rgb = RGBColor(0x85,0xc1,0xe9)
river.line.fill.background()
txt(s, 'р. Варзоб', Inches(5.82), Inches(3.0), Inches(0.55), Inches(1.0),
    size=7, color=BLUE, align=PP_ALIGN.CENTER)

# markers
markers = [
    (Inches(2.8), Inches(4.0), 'А', GREEN_DARK, '(вы здесь)'),
    (Inches(1.2), Inches(2.7), 'Б', RGBColor(0x27,0xae,0x60), 'Пластик, Стекло'),
    (Inches(4.5), Inches(2.7), 'В', RGBColor(0xe6,0x7e,0x22), 'Металл, Электроника'),
    (Inches(2.0), Inches(5.2), 'Г', RGBColor(0x8e,0x44,0xad), 'Все виды'),
]
for (ml, mt, label, mc, mname) in markers:
    m = s.shapes.add_shape(9, ml, mt, Inches(0.45), Inches(0.45))
    m.fill.solid(); m.fill.fore_color.rgb = mc; m.line.fill.background()
    txt(s, label, ml, mt + Inches(0.03), Inches(0.45), Inches(0.42),
        size=14, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    txt(s, mname, ml + Inches(0.5), mt + Inches(0.05), Inches(1.8), Inches(0.35),
        size=9, color=DARK)

# street labels
txt(s, 'пр. Рудаки', Inches(2.85), Inches(1.65), Inches(1.5), Inches(0.3), size=8, color=DARK)
txt(s, 'ул. Айни', Inches(0.42), Inches(4.12), Inches(1.0), Inches(0.28), size=8, color=DARK)

# right panel — info
txt(s, 'Пункты приёма отходов', Inches(7.3), Inches(1.6), Inches(5.7), Inches(0.6),
    size=18, bold=True, color=GREEN_DARK)
points = [
    ('Б', GREEN_MID, 'пр. Дусти, 8', '380 м · 5 мин пешком', 'Пластик, Стекло, Бумага'),
    ('В', RGBColor(0xe6,0x7e,0x22), 'ул. Фирдавси, 22', '620 м · 8 мин пешком', 'Металл, Электроника'),
    ('Г', RGBColor(0x8e,0x44,0xad), 'ул. Айни, 45', '290 м · 4 мин пешком', 'Все виды отходов'),
]
for i, (label, lc, addr, dist, acc) in enumerate(points):
    cy = Inches(2.4 + i * 1.6)
    pc = rbox(s, Inches(7.3), cy, Inches(5.7), Inches(1.45), WHITE)
    pc.line.color.rgb = lc; pc.line.width = util.Pt(1.5)
    m2 = s.shapes.add_shape(9, Inches(7.4), cy + Inches(0.35), Inches(0.7), Inches(0.7))
    m2.fill.solid(); m2.fill.fore_color.rgb = lc; m2.line.fill.background()
    txt(s, label, Inches(7.4), cy + Inches(0.38), Inches(0.7), Inches(0.65),
        size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    txt(s, addr, Inches(8.2), cy + Inches(0.1), Inches(4.5), Inches(0.4),
        size=14, bold=True, color=DARK)
    txt(s, dist, Inches(8.2), cy + Inches(0.5), Inches(4.5), Inches(0.35), size=11, color=GREEN_DARK)
    txt(s, '📦 ' + acc, Inches(8.2), cy + Inches(0.85), Inches(4.5), Inches(0.45), size=11, color=RGBColor(0x55,0x55,0x55))

txt(s, '👆 Нажми на маркер — увидишь маршрут и время до точки',
    Inches(7.3), Inches(7.0), Inches(5.8), Inches(0.4),
    size=12, color=GREEN_MID, align=PP_ALIGN.LEFT)

# ─────────────────────────────────────────────
# SLIDE 9 — СИСТЕМА УРОВНЕЙ И ECOCOIN
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '🪙  Система бонусов EcoCoin и уровни', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

levels = [
    ('🌱', 'Новичок',   '0–99',    '1 монета за скан'),
    ('🌿', 'Эко-друг',  '100–499', '1.5 монеты за скан'),
    ('🌳', 'Защитник',  '500–999', '2 монеты за скан'),
    ('⭐', 'Эко-герой', '1000–1999','3 монеты за скан'),
    ('👑', 'Легенда',   '2000+',   '5 монет за скан'),
]
for i, (em, name, coins, bonus) in enumerate(levels):
    cx = Inches(0.4 + i * 2.58)
    # card
    lc2 = rbox(s, cx, Inches(1.7), Inches(2.4), Inches(3.0), WHITE)
    lc2.line.color.rgb = GREEN_MID; lc2.line.width = util.Pt(1.5)
    # star/icon
    ic = s.shapes.add_shape(9, cx + Inches(0.6), Inches(1.9), Inches(1.2), Inches(1.2))
    ic.fill.solid(); ic.fill.fore_color.rgb = GREEN_LIGHT; ic.line.fill.background()
    txt(s, em, cx + Inches(0.6), Inches(1.95), Inches(1.2), Inches(1.1), size=36, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, name, cx + Inches(0.05), Inches(3.15), Inches(2.3), Inches(0.45),
        size=14, bold=True, color=GREEN_DARK, align=PP_ALIGN.CENTER)
    txt(s, coins + ' монет', cx + Inches(0.05), Inches(3.6), Inches(2.3), Inches(0.4),
        size=11, color=RGBColor(0x55,0x55,0x55), align=PP_ALIGN.CENTER)
    txt(s, bonus, cx + Inches(0.05), Inches(4.0), Inches(2.3), Inches(0.55),
        size=11, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

# how to earn
box(s, Inches(0.4), Inches(5.0), Inches(12.5), Inches(0.5), GREEN_DARK)
txt(s, 'Как заработать EcoCoins?', Inches(0.6), Inches(5.05), Inches(12.0), Inches(0.4),
    size=16, bold=True, color=WHITE)
earn = [
    ('📦', 'Сдать 1 пакет мусора', '+10 монет'),
    ('📅', 'Ежедневный бонус', '+5 монет'),
    ('👥', 'Пригласить друга', '+50 монет'),
    ('🏆', 'Топ района/месяц', '+200 монет'),
]
for i, (em, act, val) in enumerate(earn):
    cx2 = Inches(0.4 + i * 3.3)
    ec = rbox(s, cx2, Inches(5.6), Inches(3.1), Inches(1.6), WHITE)
    ec.line.color.rgb = GREEN_LIGHT; ec.line.width = util.Pt(1)
    txt(s, em + '  ' + act, cx2 + Inches(0.2), Inches(5.75), Inches(2.7), Inches(0.5),
        size=13, bold=True, color=DARK)
    txt(s, val, cx2 + Inches(0.2), Inches(6.25), Inches(2.7), Inches(0.5),
        size=18, bold=True, color=GREEN_MID)

# ─────────────────────────────────────────────
# SLIDE 10 — ЧАТЫ И СОРЕВНОВАНИЯ
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '💬  Чаты, жалобы и городские соревнования', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=28, bold=True, color=WHITE)

chats = [
    ('📢', 'Жалобы', 'Сообщить о проблеме:\n• Переполненный контейнер\n• Незаконная свалка\n• Сломанный бак', GREEN_MID),
    ('🚨', 'Нарушения', 'Зафиксировать нарушение:\n• Выброс мусора в неположенном месте\n• Несанкционированная свалка\n• Штрафные санкции', RGBColor(0xe7,0x4c,0x3c)),
    ('🎧', 'Поддержка', 'Живая поддержка:\n• Вопросы по приложению\n• Консультации по сортировке\n• Обратная связь', BLUE),
    ('🏆', 'Соревнования', 'Конкурс районов:\n• Рейтинг по кг мусора\n• Ежемесячный чемпион\n• Призы победителям', GOLD),
]
for i, (em, name, desc, cc) in enumerate(chats):
    cx = Inches(0.4 + i * 3.2)
    cc2 = rbox(s, cx, Inches(1.7), Inches(3.0), Inches(4.5), WHITE)
    cc2.line.color.rgb = cc; cc2.line.width = util.Pt(2)
    box(s, cx, Inches(1.7), Inches(3.0), Inches(0.65), cc)
    txt(s, em + '  ' + name, cx + Inches(0.1), Inches(1.73), Inches(2.8), Inches(0.6),
        size=14, bold=True, color=WHITE)
    ic2 = s.shapes.add_shape(9, cx + Inches(0.9), Inches(2.5), Inches(1.2), Inches(1.2))
    ic2.fill.solid(); ic2.fill.fore_color.rgb = GREEN_LIGHT; ic2.line.fill.background()
    txt(s, em, cx + Inches(0.9), Inches(2.55), Inches(1.2), Inches(1.1), size=36, align=PP_ALIGN.CENTER, color=DARK)
    txt(s, desc, cx + Inches(0.1), Inches(3.8), Inches(2.8), Inches(2.2),
        size=11, color=RGBColor(0x33,0x33,0x33))

# leaderboard snippet
box(s, Inches(0.4), Inches(6.4), Inches(12.5), Inches(0.9), RGBColor(0xe8,0xf5,0xe9))
txt(s, '🏅  Таблица лидеров:', Inches(0.6), Inches(6.45), Inches(2.5), Inches(0.5),
    size=13, bold=True, color=GREEN_DARK)
lb = [('1.', 'Акбар Р.', 'Душанбе', '2840 монет'), ('2.', 'Малика У.', 'Ташкент', '2310 монет'), ('3.', 'Бекзод А.', 'Бишкек', '1950 монет')]
for i, (pos, name2, city2, coins2) in enumerate(lb):
    txt(s, f'{pos} {name2} ({city2}) — {coins2}',
        Inches(3.3 + i*3.1), Inches(6.48), Inches(3.0), Inches(0.45),
        size=12, color=DARK)

# ─────────────────────────────────────────────
# SLIDE 11 — ТЕХНИЧЕСКАЯ АРХИТЕКТУРА
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, LIGHT_GRAY)
box(s, 0, 0, W, Inches(1.4), GREEN_DARK)
txt(s, '⚙️  Техническая архитектура платформы', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

# 3 columns
cols = [
    ('📱', 'Мобильное\nприложение', [
        '• HTML5 / CSS3 / Vanilla JS',
        '• Адаптивный дизайн (mobile-first)',
        '• SVG-карта с анимацией маршрутов',
        '• Canvas QR-генератор (без CDN)',
        '• LocalStorage для данных',
        '• 5-вкладочная навигация',
    ], GREEN_DARK),
    ('🌐', 'Публикация\nи доступ', [
        '• GitHub Pages (бесплатный хостинг)',
        '• CDN-доставка контента',
        '• Без backend — чистый фронтенд',
        '• Работает в любом браузере',
        '• Быстрая загрузка (< 2 сек)',
        '• Без внешних зависимостей',
    ], BLUE),
    ('🔮', 'Дорожная\nкарта', [
        '• Backend API (Node.js / Python)',
        '• База данных пользователей',
        '• Реальные SMS-уведомления',
        '• Интеграция с заводами',
        '• Умные IoT-датчики веса',
        '• Мобильное приложение (Flutter)',
    ], GOLD),
]
for i, (em, title2, items, cc3) in enumerate(cols):
    cx = Inches(0.4 + i * 4.3)
    cc4 = rbox(s, cx, Inches(1.7), Inches(4.0), Inches(5.5), WHITE)
    cc4.line.color.rgb = cc3; cc4.line.width = util.Pt(2)
    box(s, cx, Inches(1.7), Inches(4.0), Inches(0.8), cc3)
    txt(s, em + '  ' + title2, cx + Inches(0.1), Inches(1.75), Inches(3.8), Inches(0.75),
        size=15, bold=True, color=WHITE)
    for j, item in enumerate(items):
        txt(s, item, cx + Inches(0.2), Inches(2.6 + j*0.55), Inches(3.7), Inches(0.5),
            size=12, color=RGBColor(0x33,0x33,0x33))

# ─────────────────────────────────────────────
# SLIDE 12 — ВОЗДЕЙСТВИЕ И РЫНОК
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, GREEN_DARK)
box(s, 0, 0, W, Inches(1.4), RGBColor(0x0f, 0x3d, 0x22))
txt(s, '🌍  Масштаб и воздействие', Inches(0.5), Inches(0.2), Inches(12), Inches(1.0),
    size=30, bold=True, color=WHITE)

stats = [
    ('5', 'стран', 'Таджикистан, Узбекистан\nКыргызстан, Казахстан, Россия'),
    ('50K+', 'пользователей', 'Зарегистрировано за\nпервый месяц работы'),
    ('120 т', 'мусора', 'Собрано и переработано\nза пилотный период'),
    ('500+', 'контейнеров', 'Пунктов приёма отходов\nпо всему Душанбе'),
]
for i, (num, unit, desc2) in enumerate(stats):
    cx = Inches(0.4 + i * 3.2)
    sc = rbox(s, cx, Inches(1.8), Inches(3.0), Inches(2.8), RGBColor(0x1a,0x5c,0x32))
    sc.line.fill.background()
    txt(s, num, cx, Inches(1.9), Inches(3.0), Inches(1.2),
        size=52, bold=True, color=GREEN_MID, align=PP_ALIGN.CENTER)
    txt(s, unit, cx, Inches(3.05), Inches(3.0), Inches(0.5),
        size=18, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    txt(s, desc2, cx + Inches(0.2), Inches(3.55), Inches(2.6), Inches(0.9),
        size=11, color=RGBColor(0xa8,0xd8,0xb0), align=PP_ALIGN.CENTER)

# cities
box(s, Inches(0.4), Inches(5.0), Inches(12.5), Inches(0.5), RGBColor(0x27,0xae,0x60))
txt(s, '🌆  Города присутствия', Inches(0.6), Inches(5.05), Inches(12.0), Inches(0.4),
    size=14, bold=True, color=WHITE)
cities = ['🇹🇯 Душанбе', '🇹🇯 Худжанд', '🇺🇿 Ташкент', '🇺🇿 Самарканд', '🇺🇿 Наманган', '🇰🇬 Бишкек', '🇰🇬 Ош', '🇰🇿 Алматы']
for i, city3 in enumerate(cities):
    cb = rbox(s, Inches(0.4 + i * 1.58), Inches(5.65), Inches(1.5), Inches(0.55), RGBColor(0x1a,0x5c,0x32))
    cb.line.fill.background()
    txt(s, city3, Inches(0.4 + i * 1.58), Inches(5.68), Inches(1.5), Inches(0.5),
        size=11, color=WHITE, align=PP_ALIGN.CENTER)

txt(s, 'Цель 2027: 1 млн пользователей по Центральной Азии',
    Inches(0.4), Inches(6.5), Inches(12.5), Inches(0.5),
    size=18, bold=True, color=GOLD, align=PP_ALIGN.CENTER)

# ─────────────────────────────────────────────
# SLIDE 13 — ИТОГ / CTA
# ─────────────────────────────────────────────
s = blank(prs)
bg(s, GREEN_DARK)

# large decorative circle
c1 = s.shapes.add_shape(9, Inches(8.5), Inches(-1), Inches(6), Inches(6))
c1.fill.solid(); c1.fill.fore_color.rgb = RGBColor(0x27,0xae,0x60); c1.line.fill.background()
c2 = s.shapes.add_shape(9, Inches(-1), Inches(3), Inches(4), Inches(4))
c2.fill.solid(); c2.fill.fore_color.rgb = RGBColor(0x0f,0x3d,0x22); c2.line.fill.background()

txt(s, '🌿', Inches(1), Inches(0.8), Inches(2), Inches(1.5), size=72, align=PP_ALIGN.LEFT, color=WHITE)
txt(s, 'ЭкоПлатформа', Inches(1), Inches(2.0), Inches(9), Inches(1.2),
    size=60, bold=True, color=WHITE)
txt(s, 'Умная экосистема для чистого будущего\nЦентральной Азии',
    Inches(1), Inches(3.3), Inches(8), Inches(1.0),
    size=24, color=RGBColor(0xa8,0xd8,0xb0))

# two solution pills
p1 = rbox(s, Inches(1), Inches(4.5), Inches(4.5), Inches(0.6), GREEN_MID)
txt(s, '🗑️  Умные баки с датчиком веса', Inches(1.1), Inches(4.55), Inches(4.3), Inches(0.5),
    size=14, bold=True, color=WHITE)
p2 = rbox(s, Inches(1), Inches(5.25), Inches(4.5), Inches(0.6), GOLD)
txt(s, '📦  QR-наклейки + скан на заводе', Inches(1.1), Inches(5.3), Inches(4.3), Inches(0.5),
    size=14, bold=True, color=WHITE)

txt(s, '🏆  2-е место · Экологический хакатон 2026',
    Inches(1), Inches(6.2), Inches(8), Inches(0.5),
    size=16, color=RGBColor(0xa8,0xd8,0xb0))

txt(s, 'Спасибо за внимание!', Inches(1), Inches(6.75), Inches(10), Inches(0.55),
    size=22, bold=True, color=GOLD, align=PP_ALIGN.LEFT)

# ─────────────────────────────────────────────
out = '/home/user/-/ЭкоПлатформа.pptx'
prs.save(out)
print('Saved:', out)
