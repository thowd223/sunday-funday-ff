from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

INK = "0E1420"
GOLD = "C9A227"
HEADER_FILL = PatternFill("solid", start_color="1B2537", end_color="1B2537")
GOLD_FILL = PatternFill("solid", start_color=GOLD, end_color=GOLD)
STRIPE_FILL = PatternFill("solid", start_color="F2F2F2", end_color="F2F2F2")
BLUE = "0000FF"     # hardcoded inputs, per xlsx skill convention
BLACK = "000000"    # formulas
GOLD_TXT = "9C7A10"
WHITE = "FFFFFF"
FONT_NAME = "Arial"
thin = Side(style="thin", color="CCCCCC")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

wb = Workbook()

# ============================================================
# Sheet 1: Cover / README
# ============================================================
cov = wb.active
cov.title = "README"
cov.sheet_view.showGridLines = False
cov.column_dimensions["A"].width = 100

def cov_line(row, text, size=11, bold=False, color="000000", gap_after=0):
    c = cov.cell(row=row, column=1, value=text)
    c.font = Font(name=FONT_NAME, size=size, bold=bold, color=color)
    return row + 1 + gap_after

r = 2
r = cov_line(r, "SUNDAY FUNDAY — LEAGUE HISTORY", 20, True, GOLD_TXT, 1)
r = cov_line(r, "Sleeper league 1313676998056378368 (2019-2025) + manually curated ESPN-era records (2012-2018)", 11, False, "666666", 2)
r = cov_line(r, "Seasons covered: 2012 (founding season, ESPN) through 2025 (Sleeper). 14 seasons total.", 11)
r = cov_line(r, "2026 is pre-draft with no games played and is excluded from all stats.", 11, gap_after=1)
r = cov_line(r, "Sheets:", 12, True)
r = cov_line(r, "  All Seasons — every team's regular-season finish, record, points, and playoff result, every year.")
r = cov_line(r, "  Season Champions — champion / runner-up / 3rd / 4th by year.")
r = cov_line(r, "  Hall of Fame — career totals per manager, formula-driven from All Seasons.")
r = cov_line(r, "  Your Career (thowd) — year-by-year finish for your team specifically.")
r = cov_line(r, "  League Awards — luck rating, point differential, season superlatives, and manager badges.", gap_after=1)
r = cov_line(r, "Notes on data:", 12, True)
r = cov_line(r, "  Champion / Runner-up / 3rd / 4th for 2019-2025 come directly from Sleeper's completed winners bracket.")
r = cov_line(r, "  For 2012-2018 (ESPN era) they're derived from the source file's \"Place Finished\" column, which was")
r = cov_line(r, "  confirmed to already reflect final post-playoff standing (cross-checked against 2019/2020 overlap years).")
r = cov_line(r, "  \"Made Playoffs\" = the other 2 of 6 playoff teams each year (12-team seasons, 2015 on); their exact")
r = cov_line(r, "  5th/6th-place result isn't separately tracked in either source, so it isn't split out. 2012-2014 was a")
r = cov_line(r, "  10-team league with a 4-team playoff, so only places 1-4 show a playoff result there — 5th and lower missed.")
r = cov_line(r, "  Regular-season rank for 2012-2018 was computed from win-loss-points using the same method as 2019-2025")
r = cov_line(r, "  (wins desc, points-for as tiebreak) since the source file only provided final standing, not reg. season rank.")
r = cov_line(r, "  Team names for 2012-2018 use each manager's franchise title from the source file's all-time key,")
r = cov_line(r, "  not necessarily that exact season's in-app team name.", gap_after=1)
r = cov_line(r, "Franchise continuity (owner handoffs treated as one continuous line, matching this league's own convention", 11, True)
r = cov_line(r, "of a franchise slot passing between owners):", 10)
r = cov_line(r, "  jphn744 = John Hartnett (2012-2018) \u2192 continued under this Sleeper handle from 2019.")
r = cov_line(r, "  YungSimba = Nick Pellegrini (2012-2018) \u2192 continued under this Sleeper handle from 2019.")
r = cov_line(r, "  TylerKeel's franchise includes an earlier \"Robertson\"-era portion per the source file's own footnote.")
r = cov_line(r, "  dnevels8's franchise includes an earlier \"Engler\"-era portion per the source file's own footnote.")

# ============================================================
# Sheet 2: All Seasons (source data)
# ============================================================
ws = wb.create_sheet("All Seasons")
headers = ["Season", "Reg. Season Rank", "Manager", "Team Name", "W", "L", "Points For", "Playoff Result",
           "Points Against", "Point Diff", "Pyth. Win %", "Luck Rating"]
for i, h in enumerate(headers, 1):
    c = ws.cell(row=1, column=i, value=h)
    c.font = Font(name=FONT_NAME, size=11, bold=True, color=WHITE)
    c.fill = HEADER_FILL
    c.alignment = Alignment(horizontal="center")
    c.border = BORDER
ws.freeze_panes = "A2"

# season, rank, manager, team, W, L, PF, result
DATA = [
    # ============ 2012-2018 (ESPN era, manually curated, correlated to Sleeper identities) ============
    # 2012 (10 teams)
    (2012, 1, "peterbrune", "Butt Fumble", 10, 2, 1510.00, "4th Place"),
    (2012, 2, "GBClark", "Ray Rice Elevator Party", 9, 3, 1581.00, "3rd Place"),
    (2012, 3, "JPeters19", "The Under Achievers", 9, 3, 1523.00, "Champion"),
    (2012, 4, "kdavis", "Team KSOD", 6, 6, 1461.00, "Runner-Up"),
    (2012, 5, "YungSimba", "Dear Kevin White People", 6, 6, 1443.00, "Missed Playoffs"),
    (2012, 6, "thowd", "I'm Diggin' This Gurley", 5, 7, 1405.00, "Missed Playoffs"),
    (2012, 7, "TylerKeel", "Jimmy Graham's Crackers", 4, 8, 1370.00, "Missed Playoffs"),
    (2012, 8, "assif", "WhoFalseStarted FML", 4, 8, 1353.00, "Missed Playoffs"),
    (2012, 9, "jphn744", "I'm Jonesin For De Hops", 4, 8, 1143.00, "Missed Playoffs"),
    (2012, 10, "bcorrigan30", "Chalupa Batmans", 3, 9, 1322.00, "Missed Playoffs"),
    # 2013 (10 teams)
    (2013, 1, "YungSimba", "Dear Kevin White People", 9, 4, 1636.00, "Runner-Up"),
    (2013, 2, "jphn744", "I'm Jonesin For De Hops", 8, 5, 1821.00, "Champion"),
    (2013, 3, "thowd", "I'm Diggin' This Gurley", 8, 5, 1608.00, "4th Place"),
    (2013, 4, "bcorrigan30", "Chalupa Batmans", 8, 5, 1587.00, "3rd Place"),
    (2013, 5, "peterbrune", "Butt Fumble", 7, 6, 1615.00, "Missed Playoffs"),
    (2013, 6, "kdavis", "Team KSOD", 6, 7, 1485.00, "Missed Playoffs"),
    (2013, 7, "assif", "WhoFalseStarted FML", 6, 7, 1434.00, "Missed Playoffs"),
    (2013, 8, "JPeters19", "The Under Achievers", 5, 8, 1610.00, "Missed Playoffs"),
    (2013, 9, "GBClark", "Ray Rice Elevator Party", 5, 8, 1469.00, "Missed Playoffs"),
    (2013, 10, "TylerKeel", "Jimmy Graham's Crackers", 3, 10, 1265.00, "Missed Playoffs"),
    # 2014 (10 teams)
    (2014, 1, "kdavis", "Team KSOD", 10, 3, 1749.00, "Runner-Up"),
    (2014, 2, "bcorrigan30", "Chalupa Batmans", 8, 5, 1685.00, "3rd Place"),
    (2014, 3, "jphn744", "I'm Jonesin For De Hops", 8, 5, 1673.00, "Champion"),
    (2014, 4, "YungSimba", "Dear Kevin White People", 8, 5, 1508.00, "4th Place"),
    (2014, 5, "JPeters19", "The Under Achievers", 6, 7, 1530.00, "Missed Playoffs"),
    (2014, 6, "thowd", "I'm Diggin' This Gurley", 6, 7, 1481.00, "Missed Playoffs"),
    (2014, 7, "GBClark", "Ray Rice Elevator Party", 6, 7, 1294.00, "Missed Playoffs"),
    (2014, 8, "peterbrune", "Butt Fumble", 5, 8, 1586.00, "Missed Playoffs"),
    (2014, 9, "assif", "WhoFalseStarted FML", 4, 9, 1436.00, "Missed Playoffs"),
    (2014, 10, "TylerKeel", "Jimmy Graham's Crackers", 4, 9, 1386.00, "Missed Playoffs"),
    # 2015 (12 teams — league expands, dnevels8 & SeanOMara join)
    (2015, 1, "YungSimba", "Dear Kevin White People", 9, 4, 1486.00, "4th Place"),
    (2015, 2, "SeanOMara", "Down with ODB? Yeah u know me", 9, 4, 1429.00, "3rd Place"),
    (2015, 3, "peterbrune", "Butt Fumble", 8, 5, 1645.00, "Champion"),
    (2015, 4, "jphn744", "I'm Jonesin For De Hops", 8, 5, 1608.00, "Runner-Up"),
    (2015, 5, "thowd", "I'm Diggin' This Gurley", 8, 5, 1491.00, "Made Playoffs"),
    (2015, 6, "dnevels8", "Andre Thundacock", 8, 5, 1485.00, "Made Playoffs"),
    (2015, 7, "kdavis", "Team KSOD", 6, 7, 1647.00, "Missed Playoffs"),
    (2015, 8, "TylerKeel", "Jimmy Graham's Crackers", 5, 8, 1548.00, "Missed Playoffs"),
    (2015, 9, "JPeters19", "The Under Achievers", 5, 8, 1437.00, "Missed Playoffs"),
    (2015, 10, "GBClark", "Ray Rice Elevator Party", 5, 8, 1310.00, "Missed Playoffs"),
    (2015, 11, "bcorrigan30", "Chalupa Batmans", 4, 9, 1386.00, "Missed Playoffs"),
    (2015, 12, "assif", "WhoFalseStarted FML", 3, 10, 1265.00, "Missed Playoffs"),
    # 2016 (12 teams)
    (2016, 1, "assif", "WhoFalseStarted FML", 10, 3, 1785.20, "3rd Place"),
    (2016, 2, "TylerKeel", "Jimmy Graham's Crackers", 8, 5, 1621.60, "Runner-Up"),
    (2016, 3, "kdavis", "Team KSOD", 7, 6, 1689.40, "Made Playoffs"),
    (2016, 4, "peterbrune", "Butt Fumble", 7, 6, 1652.40, "Champion"),
    (2016, 5, "dnevels8", "Andre Thundacock", 7, 6, 1551.90, "Made Playoffs"),
    (2016, 6, "bcorrigan30", "Chalupa Batmans", 7, 6, 1491.60, "4th Place"),
    (2016, 7, "GBClark", "Ray Rice Elevator Party", 7, 6, 1445.50, "Missed Playoffs"),
    (2016, 8, "jphn744", "I'm Jonesin For De Hops", 6, 7, 1531.50, "Missed Playoffs"),
    (2016, 9, "SeanOMara", "Down with ODB? Yeah u know me", 5, 8, 1582.70, "Missed Playoffs"),
    (2016, 10, "JPeters19", "The Under Achievers", 5, 8, 1421.40, "Missed Playoffs"),
    (2016, 11, "YungSimba", "Dear Kevin White People", 5, 8, 1392.70, "Missed Playoffs"),
    (2016, 12, "thowd", "I'm Diggin' This Gurley", 4, 9, 1590.60, "Missed Playoffs"),
    # 2017 (12 teams)
    (2017, 1, "kdavis", "Team KSOD", 9, 4, 1547.40, "3rd Place"),
    (2017, 2, "YungSimba", "Dear Kevin White People", 9, 4, 1535.70, "4th Place"),
    (2017, 3, "jphn744", "I'm Jonesin For De Hops", 8, 5, 1608.50, "Made Playoffs"),
    (2017, 4, "bcorrigan30", "Chalupa Batmans", 8, 5, 1402.00, "Made Playoffs"),
    (2017, 5, "thowd", "I'm Diggin' This Gurley", 7, 6, 1549.00, "Champion"),
    (2017, 6, "JPeters19", "The Under Achievers", 7, 6, 1524.10, "Runner-Up"),
    (2017, 7, "peterbrune", "Butt Fumble", 7, 6, 1494.60, "Missed Playoffs"),
    (2017, 8, "TylerKeel", "Jimmy Graham's Crackers", 6, 7, 1496.10, "Missed Playoffs"),
    (2017, 9, "assif", "WhoFalseStarted FML", 6, 7, 1476.60, "Missed Playoffs"),
    (2017, 10, "SeanOMara", "Down with ODB? Yeah u know me", 4, 9, 1307.00, "Missed Playoffs"),
    (2017, 11, "dnevels8", "Andre Thundacock", 4, 9, 1265.40, "Missed Playoffs"),
    (2017, 12, "GBClark", "Ray Rice Elevator Party", 3, 10, 1181.00, "Missed Playoffs"),
    # 2018 (12 teams)
    (2018, 1, "kdavis", "Team KSOD", 11, 2, 1842.80, "Champion"),
    (2018, 2, "thowd", "I'm Diggin' This Gurley", 9, 4, 1677.10, "4th Place"),
    (2018, 3, "peterbrune", "Butt Fumble", 8, 5, 1750.30, "Runner-Up"),
    (2018, 4, "bcorrigan30", "Chalupa Batmans", 8, 5, 1658.10, "3rd Place"),
    (2018, 5, "dnevels8", "Andre Thundacock", 7, 6, 1726.60, "Made Playoffs"),
    (2018, 6, "jphn744", "I'm Jonesin For De Hops", 7, 6, 1696.50, "Made Playoffs"),
    (2018, 7, "YungSimba", "Dear Kevin White People", 7, 6, 1660.90, "Missed Playoffs"),
    (2018, 8, "GBClark", "Ray Rice Elevator Party", 7, 6, 1633.30, "Missed Playoffs"),
    (2018, 9, "assif", "WhoFalseStarted FML", 5, 8, 1580.40, "Missed Playoffs"),
    (2018, 10, "JPeters19", "The Under Achievers", 5, 8, 1409.50, "Missed Playoffs"),
    (2018, 11, "SeanOMara", "Down with ODB? Yeah u know me", 3, 10, 1478.20, "Missed Playoffs"),
    (2018, 12, "TylerKeel", "Jimmy Graham's Crackers", 1, 12, 1348.00, "Missed Playoffs"),
    # ============ 2019-2025 (Sleeper era, from Sleeper API) ============
    (2019, 1, "JPeters19", "My Ball Zach Ertz", 8, 5, 1674.60, "4th Place"),
    (2019, 2, "SeanOMara", "Multiple Goregasms", 8, 5, 1605.90, "Runner-Up"),
    (2019, 3, "bcorrigan30", "Le'Veon on a Jet Plane", 8, 5, 1601.52, "3rd Place"),
    (2019, 4, "GBClark", "KC Chiefs Turf Team", 8, 5, 1576.60, "Made Playoffs"),
    (2019, 5, "thowd", "CAM JUju DIGGs IT!?!?", 8, 5, 1564.94, "Champion"),
    (2019, 6, "kdavis", "Team KSOD", 7, 6, 1736.50, "Made Playoffs"),
    (2019, 7, "TylerKeel", "Cookin Up A Thielen", 7, 6, 1492.96, "Missed Playoffs"),
    (2019, 8, "peterbrune", "New phone, who Dissly?", 6, 7, 1420.06, "Missed Playoffs"),
    (2019, 9, "dnevels8", "dnevels8", 5, 8, 1533.52, "Missed Playoffs"),
    (2019, 10, "jphn744", "You Are What You Ito", 5, 8, 1517.80, "Missed Playoffs"),
    (2019, 11, "YungSimba", "YungSimba", 5, 8, 1468.70, "Missed Playoffs"),
    (2019, 12, "assif", "The Return of OJ", 3, 10, 1457.46, "Missed Playoffs"),
    # 2020
    (2020, 1, "kdavis", "KSOD", 12, 1, 1821.16, "4th Place"),
    (2020, 2, "dnevels8", "Golden Tees", 8, 5, 1616.82, "Champion"),
    (2020, 3, "bcorrigan30", "Pump the Drakes", 8, 5, 1423.94, "3rd Place"),
    (2020, 4, "GBClark", "Cookin' with Mahomies", 7, 6, 1632.24, "Made Playoffs"),
    (2020, 5, "jphn744", "You Lockett Up!", 7, 6, 1601.48, "Runner-Up"),
    (2020, 6, "JPeters19", "Go Shawty Its Herbert Day", 7, 6, 1556.42, "Made Playoffs"),
    (2020, 7, "thowd", "#Champions", 6, 7, 1563.24, "Missed Playoffs"),
    (2020, 8, "assif", "Koo Whip", 6, 7, 1498.94, "Missed Playoffs"),
    (2020, 9, "YungSimba", "Chillin@the Golladay Inn", 5, 8, 1499.58, "Missed Playoffs"),
    (2020, 10, "TylerKeel", "TylerKeel", 4, 9, 1597.58, "Missed Playoffs"),
    (2020, 11, "SeanOMara", "Let Russ Cook", 4, 9, 1474.54, "Missed Playoffs"),
    (2020, 12, "peterbrune", "Beats by DeAndre", 4, 9, 1462.68, "Missed Playoffs"),
    # 2021
    (2021, 1, "jphn744", "Adams Family of Receivers", 10, 4, 1869.94, "Champion"),
    (2021, 2, "SeanOMara", "He Hurts Me", 9, 5, 1826.34, "3rd Place"),
    (2021, 3, "peterbrune", "Lights, Kamara, Action!", 8, 6, 1912.30, "Runner-Up"),
    (2021, 4, "bcorrigan30", "Football Team", 8, 6, 1781.86, "Made Playoffs"),
    (2021, 5, "kdavis", "kdavis", 8, 6, 1726.24, "4th Place"),
    (2021, 6, "YungSimba", "My FANTasy team", 8, 6, 1714.08, "Made Playoffs"),
    (2021, 7, "thowd", "Hasta Laviska", 7, 7, 1822.16, "Missed Playoffs"),
    (2021, 8, "TylerKeel", "Lamar's Donuts", 7, 7, 1762.00, "Missed Playoffs"),
    (2021, 9, "dnevels8", "Golden Tees", 6, 8, 1617.00, "Missed Playoffs"),
    (2021, 10, "assif", "Big Chubb Energy", 6, 8, 1474.20, "Missed Playoffs"),
    (2021, 11, "JPeters19", "Oatmeal Kareem Pie", 5, 9, 1629.10, "Missed Playoffs"),
    (2021, 12, "GBClark", "GBClark", 2, 12, 1393.90, "Missed Playoffs"),
    # 2022
    (2022, 1, "peterbrune", "Gettin' Diggy With It", 11, 3, 1901.90, "Runner-Up"),
    (2022, 2, "bcorrigan30", "Chubby Chasers", 9, 5, 1715.00, "3rd Place"),
    (2022, 3, "SeanOMara", "CDL Required", 9, 5, 1552.90, "4th Place"),
    (2022, 4, "YungSimba", "D'Andre 3000", 9, 5, 1662.10, "Made Playoffs"),
    (2022, 5, "GBClark", "Austin 3:16", 9, 5, 1681.30, "Made Playoffs"),
    (2022, 6, "kdavis", "Kelce You Later", 7, 7, 1615.70, "Champion"),
    (2022, 7, "assif", "Man on the Mooney", 6, 8, 1549.10, "Missed Playoffs"),
    (2022, 8, "thowd", "Dark side, Strong side", 5, 9, 1629.36, "Missed Playoffs"),
    (2022, 9, "dnevels8", "Golden Tees", 5, 9, 1516.60, "Missed Playoffs"),
    (2022, 10, "jphn744", "Golden Tee Higgins", 5, 9, 1754.70, "Missed Playoffs"),
    (2022, 11, "TylerKeel", "Canadian Tuxedos", 5, 9, 1735.40, "Missed Playoffs"),
    (2022, 12, "JPeters19", "Tua Much 2 Little 2 Late", 4, 10, 1597.90, "Missed Playoffs"),
    # 2023
    (2023, 1, "jphn744", "Play The Fields", 10, 4, 1864.08, "Champion"),
    (2023, 2, "thowd", "The Kelce Era", 10, 4, 1807.90, "3rd Place"),
    (2023, 3, "GBClark", "Austin 3:16", 9, 5, 1791.76, "Made Playoffs"),
    (2023, 4, "kdavis", "Keenan Season", 9, 5, 1728.56, "Made Playoffs"),
    (2023, 5, "TylerKeel", "Olave it", 7, 7, 1520.04, "4th Place"),
    (2023, 6, "JPeters19", "Super Ja'Marrio Brothers", 6, 8, 1725.86, "Runner-Up"),
    (2023, 7, "SeanOMara", "Teeth Optional", 6, 8, 1676.58, "Missed Playoffs"),
    (2023, 8, "YungSimba", "Najee by Nature", 6, 8, 1578.62, "Missed Playoffs"),
    (2023, 9, "bcorrigan30", "Bed, Bath, and Bijan", 6, 8, 1576.18, "Missed Playoffs"),
    (2023, 10, "dnevels8", "Golden Tees", 5, 9, 1705.50, "Missed Playoffs"),
    (2023, 11, "amenr5", "Burrowhead My Ass", 5, 9, 1662.54, "Missed Playoffs"),
    (2023, 12, "peterbrune", "CeeDeez Nuts", 5, 9, 1595.88, "Missed Playoffs"),
    # 2024
    (2024, 1, "kdavis", "Puka and Rally", 10, 4, 1739.92, "3rd Place"),
    (2024, 2, "Keughes", "M.A.K.A", 9, 5, 1629.94, "4th Place"),
    (2024, 3, "thowd", "Howdy Nabers!", 9, 5, 1622.34, "Runner-Up"),
    (2024, 4, "bcorrigan30", "Real Slim Shadys", 8, 6, 1806.06, "Made Playoffs"),
    (2024, 5, "jphn744", "Noon Tee Time", 8, 6, 1580.10, "Champion"),
    (2024, 6, "peterbrune", "Hock Tua", 8, 6, 1507.34, "Made Playoffs"),
    (2024, 7, "YungSimba", "OlaveWhenYouCallMeBigPapa", 6, 8, 1558.76, "Missed Playoffs"),
    (2024, 8, "GBClark", "LaPorta Potty", 6, 8, 1441.30, "Missed Playoffs"),
    (2024, 9, "SeanOMara", "Malort & Savior", 6, 8, 1385.04, "Missed Playoffs"),
    (2024, 10, "amenr5", "Love is Through the Air", 5, 9, 1476.58, "Missed Playoffs"),
    (2024, 11, "TylerKeel", "Showtime to Hollywood", 5, 9, 1390.28, "Missed Playoffs"),
    (2024, 12, "dnevels8", "Golden Tees", 4, 10, 1350.72, "Missed Playoffs"),
    # 2025
    (2025, 1, "bcorrigan30", "Gettin' Jeanty With It", 10, 4, 1721.84, "Runner-Up"),
    (2025, 2, "thowd", "Run CM-Sun God", 9, 5, 1693.40, "Champion"),
    (2025, 3, "jphn744", "Jacob's Ladder To 1st", 8, 6, 1628.80, "4th Place"),
    (2025, 4, "peterbrune", "CeeDeez Nuts 2.0", 8, 6, 1546.72, "3rd Place"),
    (2025, 5, "dnevels8", "Golden Tees", 8, 6, 1507.82, "Made Playoffs"),
    (2025, 6, "kdavis", "Puka and Rally 2.0", 8, 6, 1437.24, "Made Playoffs"),
    (2025, 7, "SeanOMara", "Malort & Savior", 7, 7, 1587.00, "Missed Playoffs"),
    (2025, 8, "amenr5", "Love is Through the Air", 7, 7, 1484.86, "Missed Playoffs"),
    (2025, 9, "YungSimba", "We Built This Griddy", 6, 8, 1389.50, "Missed Playoffs"),
    (2025, 10, "GBClark", "The Pitts", 5, 9, 1499.10, "Missed Playoffs"),
    (2025, 11, "TylerKeel", "JaBucky", 5, 9, 1362.58, "Missed Playoffs"),
    (2025, 12, "Keughes", "M.A.K.A", 3, 11, 1313.34, "Missed Playoffs"),
]

PA_LOOKUP = {
    # ESPN era (surname-keyed, mapped to manager)
    (2012,"peterbrune"):1333.00, (2012,"GBClark"):1362.00, (2012,"bcorrigan30"):1397.00, (2012,"kdavis"):1508.00,
    (2012,"jphn744"):1374.00, (2012,"thowd"):1431.00, (2012,"TylerKeel"):1477.00, (2012,"assif"):1429.00,
    (2012,"YungSimba"):1400.00, (2012,"JPeters19"):1400.00,
    (2013,"peterbrune"):1508.00, (2013,"GBClark"):1724.00, (2013,"bcorrigan30"):1428.00, (2013,"kdavis"):1586.00,
    (2013,"jphn744"):1496.00, (2013,"thowd"):1567.00, (2013,"TylerKeel"):1514.00, (2013,"assif"):1627.00,
    (2013,"YungSimba"):1455.00, (2013,"JPeters19"):1625.00,
    (2014,"peterbrune"):1698.00, (2014,"GBClark"):1512.00, (2014,"bcorrigan30"):1465.00, (2014,"kdavis"):1516.00,
    (2014,"jphn744"):1538.00, (2014,"thowd"):1585.00, (2014,"TylerKeel"):1455.00, (2014,"assif"):1568.00,
    (2014,"YungSimba"):1426.00, (2014,"JPeters19"):1568.00,
    (2015,"dnevels8"):1460.00, (2015,"peterbrune"):1558.00, (2015,"GBClark"):1375.00, (2015,"bcorrigan30"):1512.00,
    (2015,"kdavis"):1593.00, (2015,"jphn744"):1573.00, (2015,"thowd"):1322.00, (2015,"TylerKeel"):1607.00,
    (2015,"assif"):1492.00, (2015,"SeanOMara"):1390.00, (2015,"YungSimba"):1427.00, (2015,"JPeters19"):1430.00,
    (2016,"dnevels8"):1649.90, (2016,"peterbrune"):1597.70, (2016,"GBClark"):1611.40, (2016,"bcorrigan30"):1523.00,
    (2016,"kdavis"):1601.90, (2016,"jphn744"):1501.40, (2016,"thowd"):1669.30, (2016,"TylerKeel"):1381.70,
    (2016,"assif"):1473.30, (2016,"SeanOMara"):1544.40, (2016,"YungSimba"):1569.60, (2016,"JPeters19"):1633.00,
    (2017,"dnevels8"):1463.50, (2017,"peterbrune"):1475.00, (2017,"GBClark"):1465.60, (2017,"bcorrigan30"):1291.80,
    (2017,"kdavis"):1504.10, (2017,"jphn744"):1415.30, (2017,"thowd"):1397.60, (2017,"TylerKeel"):1529.20,
    (2017,"assif"):1500.30, (2017,"SeanOMara"):1468.90, (2017,"YungSimba"):1414.60, (2017,"JPeters19"):1461.30,
    (2018,"dnevels8"):1588.60, (2018,"peterbrune"):1701.70, (2018,"GBClark"):1663.90, (2018,"bcorrigan30"):1487.70,
    (2018,"kdavis"):1532.50, (2018,"jphn744"):1682.70, (2018,"thowd"):1522.10, (2018,"TylerKeel"):1743.50,
    (2018,"assif"):1655.20, (2018,"SeanOMara"):1691.60, (2018,"YungSimba"):1541.10, (2018,"JPeters19"):1650.70,
    # Sleeper era (from rosters API, fpts_against)
    (2019,"kdavis"):1563.84, (2019,"thowd"):1510.70, (2019,"bcorrigan30"):1620.88, (2019,"dnevels8"):1672.38,
    (2019,"peterbrune"):1559.24, (2019,"JPeters19"):1528.48, (2019,"jphn744"):1509.82, (2019,"SeanOMara"):1493.04,
    (2019,"YungSimba"):1620.96, (2019,"TylerKeel"):1484.04, (2019,"GBClark"):1505.14, (2019,"assif"):1582.04,
    (2020,"kdavis"):1404.32, (2020,"thowd"):1583.20, (2020,"bcorrigan30"):1467.60, (2020,"dnevels8"):1558.16,
    (2020,"peterbrune"):1608.34, (2020,"JPeters19"):1685.12, (2020,"jphn744"):1551.86, (2020,"SeanOMara"):1577.66,
    (2020,"YungSimba"):1593.20, (2020,"TylerKeel"):1657.54, (2020,"GBClark"):1473.16, (2020,"assif"):1588.46,
    (2021,"kdavis"):1634.54, (2021,"thowd"):1761.30, (2021,"bcorrigan30"):1618.66, (2021,"dnevels8"):1627.20,
    (2021,"peterbrune"):1787.78, (2021,"JPeters19"):1770.38, (2021,"jphn744"):1762.98, (2021,"SeanOMara"):1709.46,
    (2021,"YungSimba"):1766.92, (2021,"TylerKeel"):1717.64, (2021,"GBClark"):1781.68, (2021,"assif"):1591.78,
    (2022,"kdavis"):1763.94, (2022,"thowd"):1642.28, (2022,"bcorrigan30"):1615.14, (2022,"dnevels8"):1709.22,
    (2022,"peterbrune"):1514.10, (2022,"JPeters19"):1732.24, (2022,"jphn744"):1690.72, (2022,"SeanOMara"):1535.80,
    (2022,"YungSimba"):1649.14, (2022,"TylerKeel"):1723.04, (2022,"GBClark"):1584.80, (2022,"assif"):1750.78,
    (2023,"kdavis"):1697.78, (2023,"thowd"):1561.62, (2023,"bcorrigan30"):1583.76, (2023,"dnevels8"):1808.88,
    (2023,"peterbrune"):1786.96, (2023,"JPeters19"):1797.78, (2023,"jphn744"):1772.36, (2023,"SeanOMara"):1849.64,
    (2023,"YungSimba"):1579.96, (2023,"TylerKeel"):1556.84, (2023,"GBClark"):1543.80, (2023,"amenr5"):1694.12,
    (2024,"kdavis"):1490.62, (2024,"thowd"):1472.68, (2024,"bcorrigan30"):1605.78, (2024,"dnevels8"):1456.96,
    (2024,"peterbrune"):1587.02, (2024,"Keughes"):1550.30, (2024,"jphn744"):1528.80, (2024,"SeanOMara"):1467.60,
    (2024,"YungSimba"):1492.34, (2024,"TylerKeel"):1607.72, (2024,"GBClark"):1634.56, (2024,"amenr5"):1594.00,
    (2025,"kdavis"):1423.84, (2025,"thowd"):1372.32, (2025,"bcorrigan30"):1506.66, (2025,"dnevels8"):1530.16,
    (2025,"peterbrune"):1575.38, (2025,"Keughes"):1610.00, (2025,"jphn744"):1503.26, (2025,"SeanOMara"):1588.10,
    (2025,"YungSimba"):1476.30, (2025,"TylerKeel"):1503.60, (2025,"GBClark"):1581.74, (2025,"amenr5"):1500.84,
}
DATA = [row + (PA_LOOKUP[(row[0], row[2])],) for row in DATA]

RESULT_COLORS = {
    "Champion": ("C9A227", "0E1420"),
    "Runner-Up": ("D9D9D9", "000000"),
    "3rd Place": ("E8D9B5", "000000"),
    "4th Place": ("F0F0F0", "000000"),
    "Made Playoffs": ("DDEBF7", "000000"),
    "Missed Playoffs": ("FFFFFF", "888888"),
}

row = 2
for season, rank, mgr, team, w, l, pf, result, pa in DATA:
    vals = [season, rank, mgr, team, w, l, pf, result, pa]
    for col, v in enumerate(vals, 1):
        c = ws.cell(row=row, column=col, value=v)
        c.font = Font(name=FONT_NAME, size=10, color=BLUE)
        c.border = BORDER
        if col in (7, 9):
            c.number_format = "0.00"
        if col == 8:
            bg, fg = RESULT_COLORS.get(v, ("FFFFFF", "000000"))
            c.fill = PatternFill("solid", start_color=bg, end_color=bg)
            c.font = Font(name=FONT_NAME, size=10, bold=(v in ("Champion", "Runner-Up")), color=fg)
        if row % 2 == 0 and col != 8:
            c.fill = STRIPE_FILL
    # Point Diff (formula)
    c = ws.cell(row=row, column=10, value=f"=G{row}-I{row}")
    c.font = Font(name=FONT_NAME, size=10, color=BLACK)
    c.number_format = "0.00"
    c.border = BORDER
    # Pythagorean expected win % (exponent 2.37, standard football value)
    c = ws.cell(row=row, column=11, value=f"=G{row}^2.37/(G{row}^2.37+I{row}^2.37)")
    c.font = Font(name=FONT_NAME, size=10, color=BLACK)
    c.number_format = "0.0%"
    c.border = BORDER
    # Luck Rating = actual win% - pythagorean expected win%
    c = ws.cell(row=row, column=12, value=f"=(E{row}/(E{row}+F{row}))-K{row}")
    c.font = Font(name=FONT_NAME, size=10, color=BLACK)
    c.number_format = "+0.0%;-0.0%"
    c.border = BORDER
    if row % 2 == 0:
        for col in (10, 11, 12):
            ws.cell(row=row, column=col).fill = STRIPE_FILL
    # helper: last place flag (worst reg-season rank that year) — used by League Awards sacko count
    c = ws.cell(row=row, column=13, value=f"=IF(B{row}=_xlfn.MAXIFS($B$2:$B${len(DATA)+1},$A$2:$A${len(DATA)+1},A{row}),1,0)")
    c.font = Font(name=FONT_NAME, size=9, color="AAAAAA")
    row += 1

ws.cell(row=1, column=13, value="Last Place?").font = Font(name=FONT_NAME, size=9, italic=True, color="AAAAAA")
widths = [8, 16, 14, 26, 6, 6, 12, 16, 12, 11, 11, 11, 11]
for i, wdt in enumerate(widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = wdt
ws.auto_filter.ref = f"A1:M{row-1}"
LAST_ROW = row - 1

# ============================================================
# Sheet 3: Season Champions
# ============================================================
sc = wb.create_sheet("Season Champions")
sc_headers = ["Season", "Champion", "Runner-Up", "3rd Place", "4th Place"]
for i, h in enumerate(sc_headers, 1):
    c = sc.cell(row=1, column=i, value=h)
    c.font = Font(name=FONT_NAME, size=11, bold=True, color=WHITE)
    c.fill = HEADER_FILL
    c.border = BORDER
    c.alignment = Alignment(horizontal="center")
sc.freeze_panes = "A2"

seasons_sorted = sorted(set(d[0] for d in DATA))
for i, season in enumerate(seasons_sorted, 2):
    sc.cell(row=i, column=1, value=season).font = Font(name=FONT_NAME, bold=True)
    for j, result in enumerate(["Champion", "Runner-Up", "3rd Place", "4th Place"], 2):
        formula = (
            f'=INDEX(\'All Seasons\'!$D$2:$D${LAST_ROW},'
            f'MATCH(1,(\'All Seasons\'!$A$2:$A${LAST_ROW}=A{i})*'
            f'(\'All Seasons\'!$H$2:$H${LAST_ROW}="{result}"),0))'
        )
        c = sc.cell(row=i, column=j, value=formula)
        c.font = Font(name=FONT_NAME, size=10, color=BLACK)
        c.border = BORDER
    for col in range(1, 6):
        sc.cell(row=i, column=col).border = BORDER
        if i % 2 == 0:
            sc.cell(row=i, column=col).fill = STRIPE_FILL

sc_widths = [8, 26, 26, 26, 26]
for i, wdt in enumerate(sc_widths, 1):
    sc.column_dimensions[get_column_letter(i)].width = wdt

note = sc.cell(row=len(seasons_sorted) + 3, column=1,
    value="Formulas array-match manager names from All Seasons by season + playoff result (Ctrl+Shift+Enter compatible; openpyxl-recalculated).")
note.font = Font(name=FONT_NAME, size=9, italic=True, color="888888")

# ============================================================
# Sheet 4: Hall of Fame (formula-driven aggregation)
# ============================================================
hof = wb.create_sheet("Hall of Fame")
hof_headers = ["Manager", "Seasons Played", "Championships", "Runner-Ups", "3rd Places",
               "Playoff Appearances", "Career W", "Career L", "Win %", "Career Points For"]
for i, h in enumerate(hof_headers, 1):
    c = hof.cell(row=1, column=i, value=h)
    c.font = Font(name=FONT_NAME, size=11, bold=True, color=WHITE)
    c.fill = HEADER_FILL
    c.border = BORDER
    c.alignment = Alignment(horizontal="center", wrap_text=True)
hof.freeze_panes = "A2"
hof.row_dimensions[1].height = 30

managers = sorted(set(d[2] for d in DATA))
AS = "'All Seasons'"
for i, mgr in enumerate(managers, 2):
    hof.cell(row=i, column=1, value=mgr).font = Font(name=FONT_NAME, bold=True)
    hof.cell(row=i, column=2, value=f'=COUNTIF({AS}!$C$2:$C${LAST_ROW},A{i})')
    hof.cell(row=i, column=3, value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"Champion")')
    hof.cell(row=i, column=4, value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"Runner-Up")')
    hof.cell(row=i, column=5, value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"3rd Place")')
    hof.cell(row=i, column=6,
        value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"Champion")'
              f'+COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"Runner-Up")'
              f'+COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"3rd Place")'
              f'+COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"4th Place")'
              f'+COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$H$2:$H${LAST_ROW},"Made Playoffs")')
    hof.cell(row=i, column=7, value=f'=SUMIF({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$E$2:$E${LAST_ROW})')
    hof.cell(row=i, column=8, value=f'=SUMIF({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$F$2:$F${LAST_ROW})')
    hof.cell(row=i, column=9, value=f'=IF((G{i}+H{i})=0,0,G{i}/(G{i}+H{i}))')
    hof.cell(row=i, column=10, value=f'=SUMIF({AS}!$C$2:$C${LAST_ROW},A{i},{AS}!$G$2:$G${LAST_ROW})')
    for col in range(1, 11):
        c = hof.cell(row=i, column=col)
        c.border = BORDER
        if col > 1:
            c.font = Font(name=FONT_NAME, size=10, color=BLACK)
        if col == 9:
            c.number_format = "0.0%"
        if col == 10:
            c.number_format = "#,##0.0"
        if i % 2 == 0:
            c.fill = STRIPE_FILL

# highlight the 2 champions gold
hof.conditional_formatting = hof.conditional_formatting  # no-op, keep simple manual highlight instead
for i, mgr in enumerate(managers, 2):
    if mgr in ("thowd",):
        for col in range(1, 11):
            hof.cell(row=i, column=col).fill = PatternFill("solid", start_color="FFF3C4", end_color="FFF3C4")

hof_widths = [14, 14, 14, 12, 11, 18, 10, 10, 9, 16]
for i, wdt in enumerate(hof_widths, 1):
    hof.column_dimensions[get_column_letter(i)].width = wdt
hof.auto_filter.ref = f"A1:J{len(managers)+1}"

sort_note = hof.cell(row=len(managers) + 3, column=1,
    value="thowd's row highlighted for reference. Sort by Championships / Win % as you like — this is a live filterable table.")
sort_note.font = Font(name=FONT_NAME, size=9, italic=True, color="888888")

# ============================================================
# Sheet 5: Your Career (thowd)
# ============================================================
yc = wb.create_sheet("Your Career (thowd)")
yc_headers = ["Season", "Team Name", "Reg. Season Rank", "W", "L", "Points For", "Playoff Result"]
for i, h in enumerate(yc_headers, 1):
    c = yc.cell(row=1, column=i, value=h)
    c.font = Font(name=FONT_NAME, size=11, bold=True, color=WHITE)
    c.fill = HEADER_FILL
    c.border = BORDER
    c.alignment = Alignment(horizontal="center")
yc.freeze_panes = "A2"

for i, season in enumerate(seasons_sorted, 2):
    yc.cell(row=i, column=1, value=season).font = Font(name=FONT_NAME, bold=True)
    col_map = {2: "D", 3: "B", 4: "E", 5: "F", 6: "G", 7: "H"}
    for out_col, src_col in col_map.items():
        formula = (
            f'=INDEX({AS}!${src_col}$2:${src_col}${LAST_ROW},'
            f'MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{i})*({AS}!$C$2:$C${LAST_ROW}="thowd"),0))'
        )
        c = yc.cell(row=i, column=out_col, value=formula)
        c.font = Font(name=FONT_NAME, size=10, color=BLACK)
        if out_col == 6:
            c.number_format = "0.00"
    for col in range(1, 8):
        yc.cell(row=i, column=col).border = BORDER
        if i % 2 == 0:
            yc.cell(row=i, column=col).fill = STRIPE_FILL

# career totals row
tot_row = len(seasons_sorted) + 2
yc.cell(row=tot_row, column=1, value="CAREER").font = Font(name=FONT_NAME, bold=True, color=GOLD_TXT)
yc.cell(row=tot_row, column=4, value=f"=SUM(D2:D{tot_row-1})").font = Font(name=FONT_NAME, bold=True)
yc.cell(row=tot_row, column=5, value=f"=SUM(E2:E{tot_row-1})").font = Font(name=FONT_NAME, bold=True)
yc.cell(row=tot_row, column=6, value=f"=SUM(F2:F{tot_row-1})").font = Font(name=FONT_NAME, bold=True)
yc.cell(row=tot_row, column=6).number_format = "0.00"
winpct_row = tot_row + 1
yc.cell(row=winpct_row, column=1, value="Career Win %").font = Font(name=FONT_NAME, italic=True)
yc.cell(row=winpct_row, column=4, value=f"=D{tot_row}/(D{tot_row}+E{tot_row})").number_format = "0.0%"
for col in range(1, 8):
    yc.cell(row=tot_row, column=col).border = Border(top=Side(style="double"))

yc_widths = [8, 26, 16, 6, 6, 12, 16]
for i, wdt in enumerate(yc_widths, 1):
    yc.column_dimensions[get_column_letter(i)].width = wdt

# ============================================================
# Sheet 6: League Awards
# ============================================================
la = wb.create_sheet("League Awards")
la.sheet_view.showGridLines = False

r = 2
c = la.cell(row=r, column=1, value="LEAGUE AWARDS")
c.font = Font(name=FONT_NAME, size=18, bold=True, color=GOLD_TXT)
r += 1
c = la.cell(row=r, column=1, value="Luck rating, point differential, and career superlatives — modeled on the stat categories dedicated league-history tools (e.g. Fantasy Record Book) track.")
c.font = Font(name=FONT_NAME, size=10, italic=True, color="666666")
r += 2

# ---- Trophy Case ----
c = la.cell(row=r, column=1, value="TROPHY CASE")
c.font = Font(name=FONT_NAME, size=13, bold=True, color=GOLD_TXT)
r += 1
tc_header_row = r
tc_headers = ["Manager", "Seasons", "Titles", "Runner-Ups", "Sackos", "Career PF", "Career PA", "Point Diff", "Avg Luck Rating"]
for i, h in enumerate(tc_headers, 1):
    cc = la.cell(row=tc_header_row, column=i, value=h)
    cc.font = Font(name=FONT_NAME, size=10, bold=True, color=WHITE)
    cc.fill = HEADER_FILL
    cc.border = BORDER
    cc.alignment = Alignment(horizontal="center", wrap_text=True)
r += 1
tc_start = r
for mgr in managers:
    la.cell(row=r, column=1, value=mgr).font = Font(name=FONT_NAME, bold=True)
    la.cell(row=r, column=2, value=f'=COUNTIF({AS}!$C$2:$C${LAST_ROW},A{r})')
    la.cell(row=r, column=3, value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{r},{AS}!$H$2:$H${LAST_ROW},"Champion")')
    la.cell(row=r, column=4, value=f'=COUNTIFS({AS}!$C$2:$C${LAST_ROW},A{r},{AS}!$H$2:$H${LAST_ROW},"Runner-Up")')
    la.cell(row=r, column=5, value=f'=SUMIFS({AS}!$M$2:$M${LAST_ROW},{AS}!$C$2:$C${LAST_ROW},A{r})')
    la.cell(row=r, column=6, value=f'=SUMIF({AS}!$C$2:$C${LAST_ROW},A{r},{AS}!$G$2:$G${LAST_ROW})')
    la.cell(row=r, column=7, value=f'=SUMIF({AS}!$C$2:$C${LAST_ROW},A{r},{AS}!$I$2:$I${LAST_ROW})')
    la.cell(row=r, column=8, value=f'=F{r}-G{r}')
    la.cell(row=r, column=9, value=f'=AVERAGEIF({AS}!$C$2:$C${LAST_ROW},A{r},{AS}!$L$2:$L${LAST_ROW})')
    for col in range(1, 10):
        cc = la.cell(row=r, column=col)
        cc.border = BORDER
        if col > 1:
            cc.font = Font(name=FONT_NAME, size=10, color=BLACK)
        if col in (6, 7, 8):
            cc.number_format = "#,##0.0"
        if col == 9:
            cc.number_format = "+0.0%;-0.0%"
        if (r - tc_start) % 2 == 1:
            cc.fill = STRIPE_FILL
    if mgr == "thowd":
        for col in range(1, 10):
            la.cell(row=r, column=col).fill = PatternFill("solid", start_color="FFF3C4", end_color="FFF3C4")
    r += 1
tc_widths = [14, 10, 8, 12, 9, 12, 12, 11, 15]
for i, wdt in enumerate(tc_widths, 1):
    la.column_dimensions[get_column_letter(i)].width = wdt
la.cell(row=r, column=1, value="Sacko = worst regular-season finish that year (proxy for last place; not a separately tracked award in either source).").font = Font(name=FONT_NAME, size=9, italic=True, color="888888")
la.cell(row=r+1, column=1, value="Luck Rating = actual win% minus Pythagorean-expected win% (based on points scored vs. allowed, exponent 2.37). Positive = overperformed points; negative = underperformed.").font = Font(name=FONT_NAME, size=9, italic=True, color="888888")
r += 4

# ---- Season Superlatives ----
c = la.cell(row=r, column=1, value="SEASON SUPERLATIVES")
c.font = Font(name=FONT_NAME, size=13, bold=True, color=GOLD_TXT)
r += 1
ss_header_row = r
ss_headers = ["Season", "Champion", "Highest Scorer", "Best Record", "Luckiest Team", "Unluckiest Team"]
for i, h in enumerate(ss_headers, 1):
    cc = la.cell(row=ss_header_row, column=i, value=h)
    cc.font = Font(name=FONT_NAME, size=10, bold=True, color=WHITE)
    cc.fill = HEADER_FILL
    cc.border = BORDER
    cc.alignment = Alignment(horizontal="center")
r += 1
ss_start = r
for season in seasons_sorted:
    la.cell(row=r, column=1, value=season).font = Font(name=FONT_NAME, bold=True)
    la.cell(row=r, column=2, value=(
        f'=INDEX({AS}!$C$2:$C${LAST_ROW},MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{r})*({AS}!$H$2:$H${LAST_ROW}="Champion"),0))'
    ))
    la.cell(row=r, column=3, value=(
        f'=INDEX({AS}!$C$2:$C${LAST_ROW},MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{r})*'
        f'({AS}!$G$2:$G${LAST_ROW}=_xlfn.MAXIFS({AS}!$G$2:$G${LAST_ROW},{AS}!$A$2:$A${LAST_ROW},A{r})),0))'
    ))
    la.cell(row=r, column=4, value=(
        f'=INDEX({AS}!$C$2:$C${LAST_ROW},MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{r})*({AS}!$B$2:$B${LAST_ROW}=1),0))'
    ))
    la.cell(row=r, column=5, value=(
        f'=INDEX({AS}!$C$2:$C${LAST_ROW},MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{r})*'
        f'({AS}!$L$2:$L${LAST_ROW}=_xlfn.MAXIFS({AS}!$L$2:$L${LAST_ROW},{AS}!$A$2:$A${LAST_ROW},A{r})),0))'
    ))
    la.cell(row=r, column=6, value=(
        f'=INDEX({AS}!$C$2:$C${LAST_ROW},MATCH(1,({AS}!$A$2:$A${LAST_ROW}=A{r})*'
        f'({AS}!$L$2:$L${LAST_ROW}=_xlfn.MINIFS({AS}!$L$2:$L${LAST_ROW},{AS}!$A$2:$A${LAST_ROW},A{r})),0))'
    ))
    for col in range(1, 7):
        cc = la.cell(row=r, column=col)
        cc.border = BORDER
        if col > 1:
            cc.font = Font(name=FONT_NAME, size=10, color=BLACK)
        if (r - ss_start) % 2 == 1:
            cc.fill = STRIPE_FILL
    r += 1
ss_widths = [8, 14, 14, 14, 14, 15]
for i, wdt in enumerate(ss_widths, 1):
    la.column_dimensions[get_column_letter(i)].width = ss_widths[i-1]
r += 2

# ---- Manager Badges (qualitative, hardcoded narrative) ----
c = la.cell(row=r, column=1, value="MANAGER BADGES")
c.font = Font(name=FONT_NAME, size=13, bold=True, color=GOLD_TXT)
r += 1
c = la.cell(row=r, column=1, value="A read of each manager's career shape — not a formula output, just the story the numbers tell.")
c.font = Font(name=FONT_NAME, size=9, italic=True, color="888888")
r += 1
badges = [
    ("jphn744", "The Closer", "5 titles from 10 playoff trips (50% conversion) — the best in league history at finishing the job."),
    ("kdavis", "Iron Throne, Empty Hand", "Best career win% (62%) and the most playoff trips (12) of anyone, but only 2 titles (17% conversion) — the best regular-season team that can't close, including a 12-1 season that ended in 4th."),
    ("bcorrigan30", "Bronze Standard", "6 third-place finishes across 14 seasons and zero titles — reaches the final four almost every deep run, never wins it."),
    ("thowd", "Big Game Hunter", "3 titles (2017, 2019, 2025) in 8 playoff trips — the only manager active in both the ESPN and Sleeper eras to win a championship in each."),
    ("TylerKeel", "Wooden Spoon King", "3 last-place finishes, more than anyone else, including the worst single season in league history (1-12 in 2018)."),
    ("peterbrune", "Boom or Bust", "Set the all-time single-season scoring record (1912.3 in 2021) — and lost that year's championship anyway."),
    ("YungSimba", "The Nearly Man", "3 fourth-place finishes, the most of anyone at that exact spot — agonizingly close, repeatedly."),
    ("dnevels8", "Late Arrival, Fast Learner", "Joined as an expansion team in 2015 and already has a title (2020) despite the shortest tenure of the long-time managers."),
    ("GBClark", "Journeyman", "14 seasons, 5 playoff trips, 0 titles — the definition of the league's steady middle class."),
    ("SeanOMara", "Feast or Famine", "11 seasons split between deep playoff runs (a 3rd place finish) and a last-place year — no in-between."),
    ("assif", "Foundational, Fadeless", "One of the league's 2012 founders; 11 seasons without a title, but never the league's worst team either."),
    ("amenr5", "Too Early to Tell", "Only 3 seasons in — the newest long-tenured manager still building a track record."),
]
badge_header_row = r
for i, h in enumerate(["Manager", "Badge", "Why"], 1):
    cc = la.cell(row=badge_header_row, column=i, value=h)
    cc.font = Font(name=FONT_NAME, size=10, bold=True, color=WHITE)
    cc.fill = HEADER_FILL
    cc.border = BORDER
r += 1
badge_start = r
for mgr, badge, why in badges:
    la.cell(row=r, column=1, value=mgr).font = Font(name=FONT_NAME, bold=True, size=10)
    la.cell(row=r, column=2, value=badge).font = Font(name=FONT_NAME, bold=True, size=10, color=GOLD_TXT)
    la.cell(row=r, column=3, value=why).font = Font(name=FONT_NAME, size=10)
    la.cell(row=r, column=3).alignment = Alignment(wrap_text=True, vertical="top")
    la.row_dimensions[r].height = 30
    for col in range(1, 4):
        la.cell(row=r, column=col).border = BORDER
        if (r - badge_start) % 2 == 1:
            la.cell(row=r, column=col).fill = STRIPE_FILL
    r += 1
la.column_dimensions["A"].width = 14
la.column_dimensions["B"].width = 22
la.column_dimensions["C"].width = 95

wb.save("/home/claude/sf_history/Sunday_Funday_League_History.xlsx")
print("saved")
