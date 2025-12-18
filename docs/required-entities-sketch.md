I think our data model is a bit half baked right now. we've cobbled things together, but are missing some nuance. if we keep spot fixing I'm worried we'll overlook a more robust or elegant solution

here are all the core resources we need, which rough hierarchy and notes:

* leagues => leagues should span multiple years, you can see historical records, most championships, etc
  * franchise => leagues can have multiple franchsise. some will be inactive if they've left the league, most will be active. franchises have teams in league years
  * league year => a specific year in the leagues history
    * settings => year specific settings for a league, these can change year over year
    * team => a specific year a franchise played in the league
    * schedule => the planned schedule for the league matchups
    * matchups => maybe the same as schedule, the scores for a schedule game
    * players => nfl players in the leages
    * standings => total w/l and scores from week 1 until now (possible this can be derived on load, or we can cache it)

and there are also week-specific resources, I'm not sure how to model them above so including here:
* weekly matchup score
* weekly player stats => in the future I'd like to show graphs and ranges of these, sort of data ux, we don't need it now but should consider it for the future
* weekly player score for the league (given scoring settings) => I'd like this to be auditable, so eg. total score = 14.2, hover over the score to see all the factors that contributed
* weekly roster (per team, starting players for a given week, locked for prior weeks, partially locked for current week as players player, can view, set future weeks [but that's not a p0 requirement])

and there are also events that I think we need to track
* roster changes (add, drop, trade, faab/wavier moves)
  * will end up reflected in the current weekly lineup, but we need a log of this event as well
  * trade/faab/waiver might need additional modeling, but at least should show up in this player transaction log


given all that can you come up with some proposal on how we can model this? start from first principles, I'm ok if we have to change a lot. but it's also ok if we don't. what's important to me is getting a really good foundation here that we can use to quickly built our killer features later. if this is just a normal bunch of tables w/ relationships, I'm cool w/ that, or if it's some crazy event log we replay on each app load perhaps that is fine. just looking for a really good solution that will last as our foundation for 2+yrs as we built out the flashes features users will pay for
