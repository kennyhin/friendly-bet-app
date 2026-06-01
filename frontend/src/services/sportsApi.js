const ESPN = 'https://site.api.espn.com/apis/site/v2/sports'

export const SPORTS = [
  { key: 'nfl',   path: 'football/nfl',                       name: 'NFL',   emoji: '🏈' },
  { key: 'nba',   path: 'basketball/nba',                     name: 'NBA',   emoji: '🏀' },
  { key: 'mlb',   path: 'baseball/mlb',                       name: 'MLB',   emoji: '⚾' },
  { key: 'nhl',   path: 'icehockey/nhl',                      name: 'NHL',   emoji: '🏒' },
  { key: 'ncaaf', path: 'football/college-football',          name: 'NCAAF', emoji: '🎓' },
  { key: 'ncaab', path: 'basketball/mens-college-basketball', name: 'NCAAB', emoji: '🏀' },
  { key: 'mls',   path: 'soccer/usa.1',                       name: 'MLS',   emoji: '⚽' },
  { key: 'epl',   path: 'soccer/eng.1',                       name: 'EPL',   emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { key: 'golf',  path: 'golf/pga',                           name: 'PGA',   emoji: '⛳' },
  { key: 'tennis',path: 'tennis/atp',                         name: 'ATP',   emoji: '🎾' },
  { key: 'ufc',   path: 'mma/ufc',                            name: 'UFC',   emoji: '🥊' },
  { key: 'f1',    path: 'racing/f1',                          name: 'F1',    emoji: '🏎️' },
]

export const PROP_STATS = {
  nfl:    ['Passing Yards', 'Passing TDs', 'Rushing Yards', 'Receiving Yards', 'Receptions', 'Interceptions', 'Sacks'],
  nba:    ['Points', 'Rebounds', 'Assists', 'Steals', 'Blocks', '3-Pointers Made', 'Pts+Reb+Ast', 'Turnovers'],
  mlb:    ['Strikeouts', 'Hits', 'RBIs', 'Home Runs', 'Walks', 'Total Bases', 'Earned Runs'],
  nhl:    ['Goals', 'Assists', 'Points', 'Shots on Goal', 'Saves', 'Power Play Points'],
  ncaaf:  ['Passing Yards', 'Rushing Yards', 'Receiving Yards', 'Touchdowns', 'Completions'],
  ncaab:  ['Points', 'Rebounds', 'Assists', '3-Pointers Made', 'Steals'],
  mls:    ['Goals', 'Assists', 'Shots on Goal', 'Saves', 'Tackles'],
  epl:    ['Goals', 'Assists', 'Shots on Goal', 'Saves', 'Tackles'],
  golf:   ['Strokes', 'Birdies', 'Bogeys', 'Eagles', 'Fairways Hit'],
  tennis: ['Sets Won', 'Games Won', 'Aces', 'Double Faults', 'Break Points'],
  ufc:    ['Significant Strikes', 'Takedowns', 'Submission Attempts', 'Knockdowns'],
  f1:     ['Finishing Position', 'Points Scored', 'Fastest Lap'],
}

export async function fetchGames(sportKey) {
  const sport = SPORTS.find(s => s.key === sportKey)
  if (!sport) return []

  try {
    const res = await fetch(`${ESPN}/${sport.path}/scoreboard`)
    if (!res.ok) throw new Error('Bad response')
    const data = await res.json()

    return (data.events || [])
      .filter(e => {
        const state = e.competitions?.[0]?.status?.type?.state
        return state === 'pre' || state === 'in'
      })
      .map(e => {
        const comp = e.competitions[0]
        const home = comp.competitors?.find(c => c.homeAway === 'home')
        const away = comp.competitors?.find(c => c.homeAway === 'away')
        const rawOdds = comp.odds?.[0] ?? null

        const odds = rawOdds ? {
          spread:         rawOdds.spread ?? null,
          overUnder:      rawOdds.overUnder ?? null,
          homeMoneyLine:  rawOdds.homeTeamOdds?.moneyLine ?? null,
          awayMoneyLine:  rawOdds.awayTeamOdds?.moneyLine ?? null,
          homeSpreadOdds: rawOdds.homeTeamOdds?.spreadOdds ?? -110,
          awaySpreadOdds: rawOdds.awayTeamOdds?.spreadOdds ?? -110,
          details:        rawOdds.details ?? null,
        } : null

        return {
          id:           e.id,
          shortName:    e.shortName ?? '',
          date:         e.date,
          statusDetail: comp.status?.type?.shortDetail ?? 'Scheduled',
          isLive:       comp.status?.type?.state === 'in',
          homeTeam: {
            name:  home?.team?.displayName ?? home?.athlete?.displayName ?? '',
            abbr:  home?.team?.abbreviation ?? home?.athlete?.shortName ?? '',
            logo:  home?.team?.logo ?? home?.athlete?.headshot?.href ?? '',
            score: home?.score ?? null,
          },
          awayTeam: {
            name:  away?.team?.displayName ?? away?.athlete?.displayName ?? '',
            abbr:  away?.team?.abbreviation ?? away?.athlete?.shortName ?? '',
            logo:  away?.team?.logo ?? away?.athlete?.headshot?.href ?? '',
            score: away?.score ?? null,
          },
          odds,
          sport:     sportKey,
          sportEmoji: sport.emoji,
          sportName: sport.name,
        }
      })
  } catch (_) {
    return []
  }
}

export function fmtML(ml) {
  if (ml == null) return 'EVEN'
  return ml > 0 ? `+${ml}` : `${ml}`
}

export function fmtSpread(spread, forHome = false) {
  if (spread == null) return null
  const val = forHome ? -spread : spread
  return val > 0 ? `+${val}` : `${val}`
}

export function fmtOdds(val) {
  if (val == null) return '-110'
  return val > 0 ? `+${val}` : `${val}`
}

export function fmtDate(iso) {
  const d   = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', timeZoneName:'short' })
  if (isToday) return `Today · ${time}`
  const tom = new Date(now); tom.setDate(tom.getDate() + 1)
  if (d.toDateString() === tom.toDateString()) return `Tomorrow · ${time}`
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) + ` · ${time}`
}

export function buildBetPicks(game, betType, side, propPlayer, propStat, propLine) {
  const home = game.homeTeam.name || game.homeTeam.abbr
  const away = game.awayTeam.name || game.awayTeam.abbr
  const o    = game.odds

  if (betType === 'moneyline') {
    const myTeam  = side === 'home' ? home : away
    const oppTeam = side === 'home' ? away : home
    const myML    = side === 'home' ? fmtML(o?.homeMoneyLine) : fmtML(o?.awayMoneyLine)
    const oppML   = side === 'home' ? fmtML(o?.awayMoneyLine) : fmtML(o?.homeMoneyLine)
    return { event:`${away} @ ${home}`, creatorPick:`${myTeam} ML (${myML})`, opponentPick:`${oppTeam} ML (${oppML})` }
  }

  if (betType === 'spread') {
    const mySpread  = side === 'home' ? fmtSpread(o?.spread, true)  : fmtSpread(o?.spread, false)
    const oppSpread = side === 'home' ? fmtSpread(o?.spread, false) : fmtSpread(o?.spread, true)
    const myTeam    = side === 'home' ? home : away
    const oppTeam   = side === 'home' ? away : home
    const myOdds    = side === 'home' ? fmtOdds(o?.homeSpreadOdds) : fmtOdds(o?.awaySpreadOdds)
    const oppOdds   = side === 'home' ? fmtOdds(o?.awaySpreadOdds) : fmtOdds(o?.homeSpreadOdds)
    return { event:`${away} @ ${home}`, creatorPick:`${myTeam} ${mySpread} (${myOdds})`, opponentPick:`${oppTeam} ${oppSpread} (${oppOdds})` }
  }

  if (betType === 'over_under') {
    const total = o?.overUnder ?? propLine
    return { event:`${away} @ ${home}`, creatorPick:`${side === 'over' ? 'Over' : 'Under'} ${total}`, opponentPick:`${side === 'over' ? 'Under' : 'Over'} ${total}` }
  }

  if (betType === 'player_prop') {
    return {
      event:        `${away} @ ${home} — ${propPlayer}`,
      creatorPick:  `${propPlayer} ${side === 'over' ? 'Over' : 'Under'} ${propLine} ${propStat}`,
      opponentPick: `${propPlayer} ${side === 'over' ? 'Under' : 'Over'} ${propLine} ${propStat}`,
    }
  }

  return { event:'', creatorPick:'', opponentPick:'' }
}
