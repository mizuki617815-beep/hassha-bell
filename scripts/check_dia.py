# 京急のダイヤ改正チェック（GitHub Actionsで週1回）
# 京急公式の「路線図・各駅情報」ページと、京急蒲田・羽田空港第3ターミナルの駅掲示時刻表PDFから
# 改正日・変更日をひろって dia-check.json に書く。アプリはこの日付と自分の時刻表の日付をくらべる
import json, re, subprocess, tempfile, urllib.request, datetime, os
UA = {"User-Agent": "Mozilla/5.0 (yumebell dia check)"}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
        return r.read()
def iso(y, m, d): return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"
dates, errs = set(), []
try:
    t = get("https://www.keikyu.co.jp/ride/kakueki/").decode("utf-8", "ignore")
    t = re.sub(r"<[^>]+>", "", t)
    for y, m, d in re.findall(r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日[^。\n]{0,6}?から", t):
        dates.add(iso(y, m, d))
except Exception as e:
    errs.append(f"page:{e}")
for st in ("KK11", "KK16"):
    try:
        b = get(f"https://www.keikyu.co.jp/ride/kakueki/pdf/timetable/{st}.pdf")
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(b); p = f.name
        txt = subprocess.run(["pdftotext", "-l", "1", p, "-"], capture_output=True, text=True).stdout
        os.unlink(p)
        found = re.findall(r"(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*改\s*正", txt)
        if not found: errs.append(f"{st}:no-date")
        for y, m, d in found: dates.add(iso(y, m, d))
    except Exception as e:
        errs.append(f"{st}:{e}")
old = {}
try: old = json.load(open("dia-check.json", encoding="utf-8"))
except Exception: pass
now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat(timespec="minutes")
ok = bool(dates) and len(errs) < 3
out = {"checkedAt": now if ok else old.get("checkedAt"), "lastTry": now, "ok": ok,
       "dates": sorted(dates) if ok else old.get("dates", []), "errors": errs}
json.dump(out, open("dia-check.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(out)
