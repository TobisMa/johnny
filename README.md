# johnny
Simulation of a von neumann arcitecture

The programm is hosted by inf-schule.de
https://inf-schule.de/content/7_rechner/3_johnny/johnny2/

With the hosting at inf-schule.de it does take some time for them to apply new versions and bugfixes. As such there is also a Github page at:
https://laubersheini.github.io/johnny
which automatically updates as soon as i make a commit to the master branch of this repo so it should always be more up to date.

## johnny changes
- implement a button to insert a row above the current selection
- when selecting an address row, make the value available to edit directly in the input field
- focus the input on selection of an address
- intelligent number reading when editing RAM values (e. g. `1.3` is understood as `01.003` which would be `TAKE 003`) 
- fixing some issues when resizing the page

This edited version can be viewed at [https://tobisma.github.io/johnny](https://tobisma.github.io/johnny)
