/**
 * Season Stories — sportswriter-style recaps for every Sunday Funday season, 2012-2025.
 *
 * Every factual claim here (scores, seeds, streaks, luck figures, records) was verified
 * against SEASONS / MATCHUP_LOG / PLAYOFF_BRACKETS / luckBySeason() before being written.
 * No player-level detail, locker-room lore, or motive is asserted — the underlying data
 * has none of that, so none of it is invented here.
 */

export interface SeasonRecap {
  season: number
  /** Punchy, magazine-cover-line headline. */
  headline: string
  /** One-sentence deck under the headline. */
  subhead?: string
  /** 2-4 narrative paragraphs. */
  paragraphs: string[]
  /** 2-4 quick-hit bullets: Game of the Year, The Collapse, etc. */
  keyMoments?: { label: string; detail: string }[]
}

export const RECAPS: SeasonRecap[] = [
  {
    season: 2012,
    headline: 'The Under Achievers Overachieve',
    subhead:
      'In the league\'s inaugural year, a roster that grew mid-season crowned a champion who blew the doors off the finale.',
    paragraphs: [
      'Sunday Funday didn\'t even start with a full boat — the early weeks of 2012 ran with as few as eight managers before the league settled at ten, and the schedule stretched to 13 regular-season weeks with a four-team playoff bolted on at the end. Out of that scramble came a fitting champion: Jordan Peters, whose team was literally named "The Under Achievers," went 9-3 from the No. 3 seed and then dismantled the bracket.',
      'Peter Brune had the league\'s best regular-season record that year at 10-2 (Garrett Clark actually edged him on point differential, +219 to +177, despite a 9-3 mark) — but the postseason had other ideas. He dropped both playoff games, first to Kurtis Davis in the semifinal (260-272) and then to Garrett Clark in the third-place game (217-252), a quiet reminder in year one that the regular-season trophy and the championship belt are not the same thing. Meanwhile Peters beat Clark 241-236 in his semifinal, then buried Davis 378-231 in the championship — a 147-point margin that remains the biggest blowout, and the highest single-game score, in league history, playoffs included, all these years later.',
      'Down at the bottom, John Hartnett endured an eight-game losing streak from Week 5 through Week 12, capped by a 173-84 beatdown at the hands of Tim Howd in Week 12 — the season\'s biggest blowout. And in a detail that only a first season could produce, two games were decided by exact ties on the scoreboard: Peters escaped Week 1 with a 146-146 "win" over Asif Lakhani, and Davis got the same treatment over Nick Pellegrini, 161-161, in Week 4 — both settled by tiebreaker rather than a single extra point.',
    ],
    keyMoments: [
      {
        label: 'Championship Blowout',
        detail: 'Jordan Peters 378, Kurtis Davis 231 — still the biggest blowout and highest single-game score in league history.',
      },
      {
        label: 'Best Record, No Trophy',
        detail: 'Peter Brune went 10-2 in the regular season and still finished 4th.',
      },
      {
        label: 'Dead Heats',
        detail: 'Two separate games in year one ended in exact ties, both broken in the winner\'s favor.',
      },
    ],
  },
  {
    season: 2013,
    headline: 'Hartnett Arrives',
    subhead: 'A 2-seed with a middling record found another gear in the playoffs and started a dynasty nobody saw coming.',
    paragraphs: [
      'John Hartnett went just 8-5 in the regular season, tucked in behind Nick Pellegrini\'s league-best 9-4, but by the all-play numbers he was actually the best team in the league — an 84-32 all-play record (72.2%) that made him one of the unluckiest managers in the league that year (-1.4 luck) relative to what his weekly scoring deserved. It didn\'t matter. Hartnett dropped 198 points on Kurtis Davis in a Week 8 rout (198-90, the league\'s biggest blowout of the season), then rolled into the playoffs and beat Brian Corrigan 251-233 in the semifinal before knocking off top-seeded Pellegrini 264-225 in the championship. It was the first of what would become the most decorated championship run in league history.',
      'Pellegrini closed the regular season with a five-game win streak (Weeks 9-13) to lock up the top seed, and he beat Tim Howd 301-291 in his own semifinal — but the championship got away from him. Keith Robertson had the opposite kind of year, going 3-10 and taking a four-game losing streak (Weeks 7-10) on his way to the league\'s worst record — his last season before leaving the league.',
      'Down in the trenches, Week 3 produced the season\'s low-water mark: Robertson managed just 63 points in a loss to Peter Brune. And Week 12 gave the league its closest finish of the year, with Jordan Peters edging Asif Lakhani 109-108.',
    ],
    keyMoments: [
      { label: 'Signature Win', detail: 'John Hartnett 198, Kurtis Davis 90 — the season\'s biggest blowout, in Week 8.' },
      { label: 'Championship', detail: 'Hartnett 264, Pellegrini 225 — the first of five titles for Hartnett.' },
      { label: 'Closest Call', detail: 'Jordan Peters escaped Week 12 with a 109-108 win over Asif Lakhani.' },
    ],
  },
  {
    season: 2014,
    headline: 'Back-to-Back, and Nobody Blinked',
    subhead: 'Hartnett repeated as champion by blowing out the No. 1 seed in the final — after blowing out the No. 2 seed to get there.',
    paragraphs: [
      'Kurtis Davis looked like the team to beat all year — he opened the season with a seven-game winning streak (Weeks 1-7), finished 10-3, and posted the league\'s best regular-season record. It bought him a bye straight into nothing, because John Hartnett was waiting. Hartnett, seeded third at 8-5, throttled Brian Corrigan 350-239 in the semifinal and then did it again to Davis in the championship, 310-180 — back-to-back titles, and back-to-back blowout wins to get the second one.',
      'It was a rough year to be on a cold streak: Asif Lakhani opened the season with a seven-game losing streak and never really turned it around (4-9 finish), while Peter Brune hit his own seven-game skid a few weeks later (Weeks 3-9) on his way to a 5-8 finish. Garrett Clark had that season\'s luckiest bounce by the numbers (+1.9 all-play luck, a 6-7 record despite a paltry 31.6% all-play rate), while Brune was the unluckiest (-2.3), going 5-8 despite scoring like a 56.4% team.',
      'The season\'s low point, literally, belonged to Tyler Keel — playing his first season in the league — with 63 points in a Week 9 loss. Brian Corrigan opened the year with the season\'s biggest blowout, 143-68 over Garrett Clark in Week 1.',
    ],
    keyMoments: [
      { label: 'Championship', detail: 'John Hartnett 310, Kurtis Davis 180 — the No. 1 seed never had a chance.' },
      { label: 'Cold Streaks', detail: 'Asif Lakhani opened the year 0-7; Peter Brune lost seven straight of his own from Weeks 3-9.' },
      { label: 'Hot Start', detail: 'Kurtis Davis won his first seven games before the wheels came off in the final.' },
    ],
  },
  {
    season: 2015,
    headline: 'Six Teams, One Twist Ending',
    subhead: 'The playoff field expanded to six for the first time — and the new format delivered the strangest championship result yet.',
    paragraphs: [
      'The postseason grew from four teams to six in 2015, giving the top two seeds a first-round bye for the first time. Peter Brune, seeded third, made the format work for him: a 155-79 rout of Andy Engler (in what would be Engler\'s only ESPN-era season — he\'d resurface in the league eight years later), a 170-144 win over No. 2 seed Sean O\'Mara, and then a championship over John Hartnett that the record books will forever list as a win — despite Hartnett actually outscoring him, 170-155. However that one got settled, it\'s Brune\'s name in the champion\'s column.',
      'Nick Pellegrini put together the league\'s best regular season (9-4) capped by a seven-game winning streak from Week 7 through Week 13 — and then lost both of his playoff games, falling to 4th place. Asif Lakhani had the opposite kind of year: a seven-game losing streak to open the season, a league-record-low 36 points in a Week 11 loss, and a 3-10 finish.',
      'Sean O\'Mara turned in the luckiest season the league had seen to that point (+3.0 — a 9-4 record despite a 46.2% all-play rate), while Kurtis Davis was the unlucky mirror image at -2.7, going just 6-7 despite scoring like a 66.8% team. The season\'s biggest blowout came in Week 13, when Tim Howd ran up 145 points against Lakhani\'s 68.',
    ],
    keyMoments: [
      { label: 'The Twist', detail: 'Peter Brune won the championship 155-170 — outscored, but not out-recorded.' },
      { label: 'League-Low Score', detail: 'Asif Lakhani managed just 36 points in a Week 11 loss.' },
      { label: 'Best Record, Early Exit', detail: 'Nick Pellegrini went 9-4 in the regular season, then lost out in the first two playoff rounds.' },
    ],
  },
  {
    season: 2016,
    headline: 'The Biggest Blowout the League Has Ever Seen',
    subhead: 'Two of the largest routs in franchise history happened in the same season — and Peter Brune still found a way to repeat as champion.',
    paragraphs: [
      'Nobody in the regular season has topped what Sean O\'Mara did to Garrett Clark in Week 6: 214.2 to 67.4, a 146.9-point margin that stands as the largest regular-season blowout in league history (only Jordan Peters\' 378-231 playoff title-game rout from 2012 is bigger, postseason included) — and O\'Mara\'s 214.2 remains the highest regular-season score anyone has ever posted. It wasn\'t even the only historic beatdown of the season: two weeks earlier, Tyler Keel had put 204.2 on Jordan Peters, a 123-point margin that still ranks as the second-biggest regular-season blowout the league has ever recorded.',
      'Amid all that chaos, Peter Brune quietly repeated as champion. Seeded fourth at 7-6, he beat devin nevels 136.9-93.5, then Asif Lakhani (the No. 1 seed, fresh off an eight-game winning streak from Weeks 5-12) 115.2-105.9, then Tyler Keel 164.7-134.3 in the final for his second straight title. Lakhani\'s 10-3 regular season, the league\'s best that year, ended in a semifinal exit and a 3rd-place finish.',
      'Tim Howd had the roughest year in the league, finishing 4-9 despite being the unluckiest manager in the field (-2.9 luck) — his all-play rate said he should have been a 53.1% team. Tyler Keel, on the other hand, rode that season\'s luckiest bounce (+1.9 all-play luck) all the way to the runner-up finish.',
    ],
    keyMoments: [
      { label: 'League Record', detail: 'Sean O\'Mara 214.2, Garrett Clark 67.4 — the biggest regular-season blowout and highest regular-season score in franchise history.' },
      { label: 'Runner-Up Blowout', detail: 'Tyler Keel dropped 204.2 on Jordan Peters in Week 4, the second-biggest regular-season margin ever.' },
      { label: 'Repeat Champion', detail: 'Peter Brune went back-to-back, beating the No. 1 seed in the semifinal along the way.' },
    ],
  },
  {
    season: 2017,
    headline: 'The 5 vs. 6 Final',
    subhead: 'Both top seeds crashed out early, leaving the two lowest-ranked playoff teams to settle it.',
    paragraphs: [
      'Kurtis Davis and Nick Pellegrini finished 1-2 in the regular season at 9-4 apiece — and both were gone before the championship. Tim Howd, seeded fifth, ran the table: a 129.1-96.4 win over Brian Corrigan, then a 168.0-144.0 upset of top-seeded Davis in the semifinal, then a 108.8-85.6 win over Jordan Peters — the No. 6 seed — for the title. It\'s the only all-bottom-half championship in league history to that point.',
      'Peters, for his part, had a wild road to the final: he opened the playoffs by edging John Hartnett 127.8-127.1 in the first round, then knocked off Pellegrini, and along the way had already delivered the season\'s biggest blowout back in Week 12 — a 157.9-77.3 demolition of the very Tim Howd team that would go on to beat him in the championship.',
      'John Hartnett quietly authored the league\'s best late-season stretch, closing on a six-game winning streak from Week 8 through Week 13, but a first-round playoff loss (on the wrong end of that 127.8-127.1 game) kept him from reaching the final. Garrett Clark had the toughest season, finishing 3-10 after opening 0-4.',
    ],
    keyMoments: [
      { label: 'Championship', detail: 'Tim Howd 108.8, Jordan Peters 85.6 — a No. 5 vs. No. 6 final.' },
      { label: 'Foreshadowing', detail: 'Jordan Peters demolished eventual champ Tim Howd 157.9-77.3 in Week 12 — then lost to him in the final.' },
      { label: 'Semifinal Upset', detail: 'Tim Howd knocked off No. 1 seed Kurtis Davis, 168.0-144.0.' },
    ],
  },
  {
    season: 2018,
    headline: 'Kurtis Davis Runs the Table; Tyler Keel Runs Out of Everything',
    subhead: 'The best regular season the league had ever seen shared a year with the worst.',
    paragraphs: [
      'Kurtis Davis went 11-2, the best regular-season record the league had produced to that point, and backed it up: a 126.0-103.9 semifinal win over Brian Corrigan, then a 164.8-120.1 championship win over Peter Brune, for his first title. He was also, somehow, the luckiest team in the league that year (+1.7) on top of being the best — there was no ceiling on this roster.',
      'At the other extreme, Tyler Keel had the worst season in league history: 1-12, a -395.5 point differential (also a league worst), and a seven-game losing streak to close it out. It got worse before it got better — in Week 7, devin nevels beat Keel 149.5-43.1, the season\'s biggest blowout, and Keel\'s 43.1 stands as one of the lowest single-week scores the league has ever produced. His all-play numbers said he "deserved" about three wins; he got one.',
      'Peter Brune returned to the championship game for the third time in his career (after winning it in 2015 and 2016) as the No. 3 seed, beating John Hartnett and Tim Howd along the way before running into the Davis buzzsaw. The season\'s closest game came in Week 5, when Davis himself needed every bit of a 121.7-121.5 win over Corrigan.',
    ],
    keyMoments: [
      { label: 'Historic Season', detail: 'Kurtis Davis went 11-2 and won it all — the best regular season in league history at that point.' },
      { label: 'Historic Bottom', detail: 'Tyler Keel finished 1-12 with a -395.5 point differential, both league worsts.' },
      { label: 'Pile-On', detail: 'devin nevels beat Keel 149.5-43.1 in Week 7 — Keel\'s 43.1 among the lowest scores ever posted.' },
    ],
  },
  {
    season: 2019,
    headline: 'Five-Way Tie at the Top, One Team Standing at the Bottom of It',
    subhead: 'The Sleeper era opened with one of the most crowded logjams in league history.',
    paragraphs: [
      'The league moved to Sleeper in 2019, and the regular season it produced was a logjam for the ages: five different managers — Jordan Peters, Sean O\'Mara, Brian Corrigan, Garrett Clark, and Tim Howd — all finished 8-5, separated only by tiebreakers for seeds 1 through 5. It was Howd, seeded fifth in that pile-up, who made it count: wins over Garrett Clark (135.8-109.6), Jordan Peters (144.5-120.1), and Sean O\'Mara (131.4-105.8) in the championship for his second title.',
      'Sean O\'Mara had one of the strangest back-to-back weeks the league has on record: 60.4 points in a Week 7 loss — the low point of his season — followed immediately by a league-high 190.8 the very next week. He rode that into the championship game, where he ultimately came up short.',
      'Kurtis Davis put up the season\'s biggest blowout, 185.6-94.5 over devin nevels in Week 6, while Asif Lakhani had the toughest year of anyone, going 3-10 with the league\'s worst luck figure (-1.7) to boot.',
    ],
    keyMoments: [
      { label: 'The Logjam', detail: 'Five managers finished the regular season 8-5, decided entirely by tiebreakers.' },
      { label: 'Jekyll and Hyde', detail: 'Sean O\'Mara scored 60.4 in Week 7, then 190.8 — the league high that week — in Week 8.' },
      { label: 'Championship', detail: 'Tim Howd 131.4, Sean O\'Mara 105.8 — Howd\'s second title, from the No. 5 seed.' },
    ],
  },
  {
    season: 2020,
    headline: 'The Streak Ends, the Upset Begins',
    subhead: 'Kurtis Davis authored the best regular season in league history and still went home early.',
    paragraphs: [
      'Kurtis Davis opened the season 12-0 and didn\'t lose until Week 13, finishing 12-1 — still the longest winning streak and the best point differential (+416.8) in league history. It didn\'t matter. Davis lost both playoff games and finished 4th, while devin nevels — seeded second — won it all, beating Brian Corrigan 148.7-108.9 and then John Hartnett 131.6-104.8 in the championship for his first title.',
      'Davis\'s regular season was also, by the numbers, one of the luckiest of the two teams involved: Brian Corrigan actually posted the luckiest season in league history by the all-play Luck Index (+3.3 — an 8-5 record despite a 36.4% all-play rate), which makes his championship-week loss to nevels sting a little less and his run to the title game make a little more sense.',
      'The season\'s biggest blowout doubled as Davis\'s coronation moment — a 202.3-121.4 win over Jordan Peters in Week 12 that also capped his 12-game streak. And Week 13 gave the league one of its closest finishes ever: Corrigan edged Peter Brune 118.3-118.2.',
    ],
    keyMoments: [
      { label: 'League Record', detail: 'Kurtis Davis opened 12-0, still the longest winning streak in league history.' },
      { label: 'League Record', detail: 'Brian Corrigan posted a +3.3 all-play Luck Index — the luckiest season anyone has had.' },
      { label: 'Championship', detail: 'devin nevels 131.6, John Hartnett 104.8 — nevels\'s first title, from the No. 2 seed.' },
    ],
  },
  {
    season: 2021,
    headline: 'Hartnett\'s Third, Brune\'s Best Numbers',
    subhead: 'The eventual champion didn\'t even lead the league in points — that was the runner-up.',
    paragraphs: [
      'John Hartnett went 10-4, rode an eight-game winning streak (Weeks 5-12), and beat Kurtis Davis (151.4-111.0) and Peter Brune (139.8-132.7) in the playoffs for his third title. But it was Brune who actually put up the bigger numbers: his 1,912.3 points scored is the most any manager has posted in a single season in league history — and he still finished runner-up.',
      'Garrett Clark had the toughest year, finishing 2-12 (the second-worst record in league history behind only Tyler Keel\'s 2018) and closing on a six-game losing streak. Tyler Keel delivered the season\'s biggest blowout at Clark\'s expense, 191.5-87.7 in Week 5.',
      'The closest game of the year came in Week 12, when Nick Pellegrini edged devin nevels 116.9-116.3. Asif Lakhani posted the league\'s best luck figure of the season at +1.9, while Tim Howd, at -1.7, had the worst of it.',
    ],
    keyMoments: [
      { label: 'League Record', detail: 'Peter Brune scored 1,912.3 points — the most in a single season in league history — and still finished runner-up.' },
      { label: 'Championship', detail: 'John Hartnett 139.8, Peter Brune 132.7 — Hartnett\'s third title.' },
      { label: 'Rough Year', detail: 'Garrett Clark finished 2-12, the second-worst record in league history.' },
    ],
  },
  {
    season: 2022,
    headline: 'The Six Seed Sneaks In',
    subhead: 'An exactly break-even regular season was somehow enough to win the whole thing.',
    paragraphs: [
      'Kurtis Davis backed into the playoffs at 7-7 — the No. 6 and final seed — and then won three straight to take the title: 124.6-108.5 over Garrett Clark, 131.8-122.1 over Brian Corrigan, and 95.0-72.1 over Peter Brune in the championship. It\'s the lowest seed to ever produce a champion in league history, and the only time an exactly .500 regular season has done it.',
      'Brune, meanwhile, had arguably the best regular season anyone had ever put together — 11-3, and a +387.8 point differential, the second-best in league history — and still came up empty in the final. It was his third career runner-up finish, more than anyone else in the league.',
      'Sean O\'Mara rode an eight-game winning streak (Weeks 6-13) to one of the league\'s luckiest seasons (+2.8 all-play Luck Index), while Tyler Keel had the unluckiest (-3.2) — the worst all-play luck figure anyone has posted in league history. Jordan Peters had the opposite kind of skid, an eight-game losing streak from Week 3 to Week 10 (tied for the longest losing streak in league history) on his way to a last-place finish.',
    ],
    keyMoments: [
      { label: 'Championship', detail: 'Kurtis Davis 95.0, Peter Brune 72.1 — the only No. 6 seed, and the only exactly-.500 team, to ever win it all.' },
      { label: 'Bridesmaid Again', detail: 'Peter Brune\'s 11-3, +387.8-differential season ended in his third career runner-up finish.' },
      { label: 'League Record', detail: 'Tyler Keel posted a -3.2 all-play Luck Index — the unluckiest season in league history.' },
    ],
  },
  {
    season: 2023,
    headline: 'The Comeback Throws a Haymaker, the Vet Throws His Fourth Ring',
    subhead: 'A manager back after eight years away delivered the year\'s biggest statement game — against the eventual champion.',
    paragraphs: [
      'John Hartnett went 10-4 as the No. 1 seed and cruised through the playoffs untouched — 142.0-93.2 over Tyler Keel, then 159.1-146.7 over Jordan Peters in the championship — for his fourth title, extending his own league record.',
      'But the season\'s loudest moment belonged to Andy Engler, back in the league for the first time since a lone 2015 season, who announced his return in Week 3 by beating Hartnett 193.2-79.7 — a 113.5-point margin, one of the biggest regular-season blowouts in league history, and against the very team that would go on to win it all.',
      'Jordan Peters reached the final from the No. 6 seed despite a 6-8 regular season — the only losing-record team to ever play in a championship game — beating Garrett Clark and Tim Howd along the way before falling to Hartnett. Peter Brune finished with the league\'s worst record that year at 5-9.',
    ],
    keyMoments: [
      { label: 'Comeback Statement', detail: 'Andy Engler, back after eight years away, upset John Hartnett 193.2-79.7 in Week 3 — one of the biggest regular-season blowouts ever.' },
      { label: 'Championship', detail: 'John Hartnett 159.1, Jordan Peters 146.7 — Hartnett\'s fourth title.' },
      { label: 'Longshot Final', detail: 'Jordan Peters reached the championship from the No. 6 seed on a 6-8 regular season.' },
    ],
  },
  {
    season: 2024,
    headline: 'Number Five',
    subhead: 'John Hartnett went back-to-back and pulled away from the pack as the winningest manager the league has ever seen.',
    paragraphs: [
      'John Hartnett went just 8-6 and slipped into the playoffs as the No. 5 seed — and then ran through it: 108.7-96.2 over Brian Corrigan, 167.4-98.2 over top-seeded Kurtis Davis, and 172.8-120.9 over Tim Howd in the championship. It was his fifth title and his second in a row, pulling him well clear of every other manager in franchise history (the next-closest has three).',
      'Kurtis Davis had the league\'s best regular season (10-4) but couldn\'t survive Hartnett in the semifinal, settling for 3rd. Two newcomers made their mark: Kevin Hughes finished 9-5 in his rookie season (4th place after a semifinal loss), while Andy Engler, in his second year, was on the wrong end of the season\'s biggest blowout — a 191.6-107.1 loss to Kurtis Davis in Week 10.',
      'Brian Corrigan quietly had one of the best scoring seasons the league has ever produced by the all-play numbers (a 76.0% all-play win rate) and still finished with the league\'s worst luck score (-2.6) — a reminder that great numbers don\'t always find the scoreboard.',
    ],
    keyMoments: [
      { label: 'Dynasty', detail: 'John Hartnett won his fifth title (and second straight) — the most in league history.' },
      { label: 'Championship', detail: 'John Hartnett 172.8, Tim Howd 120.9.' },
      { label: 'Best Team, Worst Luck', detail: 'Brian Corrigan\'s 76.0% all-play rate came with the league\'s worst luck score.' },
    ],
  },
  {
    season: 2025,
    headline: 'Corrigan\'s Best Season Ends One Win Short',
    subhead: 'The league\'s top seed made the final for the first time in his career — and ran into a three-time champion.',
    paragraphs: [
      'Tim Howd went 9-5, reeled off an eight-game winning streak from Week 2 through Week 9, and closed it out by beating John Hartnett (131.6-88.5) and Brian Corrigan (126.5-119.6) in the championship — his third career title.',
      'Corrigan, the league\'s No. 1 seed at 10-4, reached his first championship game in franchise history and came up just short. It was a strong season across the board for him after years in the middle of the pack.',
      'Kevin Hughes had a brutal sophomore slump, tumbling from a 9-5, fourth-place rookie season in 2024 to 3-11 and last place in 2025. Tim Howd delivered the season\'s biggest blowout in Week 3, 156.4-56.8 over Peter Brune, and the closest finish came in Week 6, when Andy Engler edged Brune 119.5-119.2.',
    ],
    keyMoments: [
      { label: 'Championship', detail: 'Tim Howd 126.5, Brian Corrigan 119.6 — Howd\'s third title.' },
      { label: 'First Final', detail: 'Brian Corrigan reached his first career championship game as the No. 1 seed.' },
      { label: 'Sophomore Slump', detail: 'Kevin Hughes fell from 9-5 (4th place) in 2024 to 3-11 (last place) in 2025.' },
    ],
  },
]

export function recapForSeason(season: number): SeasonRecap | undefined {
  return RECAPS.find((r) => r.season === season)
}
