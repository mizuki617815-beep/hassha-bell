# 毎日の占いデータを取ってきて fortune.json に保存する(GitHub Actionsで実行)
# 1) Zodiac Timeline(無料・表示許可あり、名前のリンク表示が条件)の総合スコア(10点満点)
# 2) JugemKey占い(原宿占い館 塔里木 監修)… 現在停止中。復活したら自動で使う
import json, re, datetime, urllib.request, xml.etree.ElementTree as ET
UA = {"User-Agent": "yumeiro-hassha-bell/1.0 (+https://mizuki617815-beep.github.io/hassha-bell/)"}
SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]
JP = ["牡羊座","牡牛座","双子座","蟹座","獅子座","乙女座","天秤座","蠍座","射手座","山羊座","水瓶座","魚座"]
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()
out = {"updated": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M"), "zt": {}, "jugem": {}}
try:
    old = json.load(open("fortune.json"))
    out["zt"].update(old.get("zt", {})); out["jugem"].update(old.get("jugem", {}))
except Exception:
    pass
# Zodiac Timeline
try:
    root = ET.fromstring(get("https://zodiactimeline.com/feed.xml"))
    for it in root.iter("item"):
        f = {}
        for ch in it:
            tag = ch.tag.split("}")[-1]
            f[tag] = (ch.text or "").strip()
        s, d, sc = f.get("sign","").lower(), f.get("date",""), f.get("score","")
        if s in SIGNS and re.match(r"\d{4}-\d{2}-\d{2}$", d) and sc:
            out["zt"].setdefault(d, {})[JP[SIGNS.index(s)]] = float(sc)
    print("zodiac timeline ok:", sorted(out["zt"].keys())[-5:])
except Exception as e:
    print("zodiac timeline NG:", e)
# JugemKey
jst = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).date()
for off in (0, 1):
    d = jst + datetime.timedelta(days=off)
    try:
        j = json.loads(get(f"http://api.jugemkey.jp/api/horoscope/free/{d:%Y/%m/%d}"))
        lst = list(j["horoscope"].values())[0]
        out["jugem"][d.isoformat()] = {x["sign"]: {k: x.get(k) for k in ("rank","content","item","color","total","love","money","job")} for x in lst}
        print("jugemkey ok:", d)
    except Exception as e:
        print("jugemkey NG:", d, e)
# 古いデータは10日分だけ残す
keep = {(jst + datetime.timedelta(days=i)).isoformat() for i in range(-3, 7)}
for k in ("zt", "jugem"):
    out[k] = {d: v for d, v in out[k].items() if d in keep}
json.dump(out, open("fortune.json", "w"), ensure_ascii=False, separators=(",", ":"))
