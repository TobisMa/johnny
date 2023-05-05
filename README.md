# johnny
Simulation of a von neumann arcitecture

The programm is hosted by inf-schule.de
https://inf-schule.de/content/7_rechner/3_johnny/johnny2/

With the hosting at inf-schule.de it does take some time for them to apply new versions and bugfixes. As such there is also a Github page at:
https://laubersheini.github.io/johnny
which automatically updates as soon as i make a commit to the master branch of this repo so it should always be more up to date.

## johnny changes
This edited version can be viewed at [https://tobisma.github.io/johnny](https://tobisma.github.io/johnny)
- implement a button to insert a row above the current selection
- when selecting an address row, make the value available to edit directly in the input field
- focus the input on selection of an address
- intelligent number reading when editing RAM values (e. g. `1.3` is understood as `01.003` which would be `TAKE 003`) 
- fixing some issues when resizing the page
- made electron packagable

## browser compatibility
I recommend to use Firefox (continue reading for the reason).  
This website works on Firefox and chrome based browsers (Edge, Chrome, ...). Not listed browsers have not been tested which does not mean they are not compatible.

The function called when clicking on `Insert Row` takes on chrome based browsers up to 3sec for whatever reason while Firefox can handle the click event nearly instantly.

## package using electron
1. Clone the repository locally and move into the folder
2. Run `npm install`
3. Make sure `npx` is globally accessable, otherwise edit either package.json to match your requirements or install npx
4. For Windows run `npm run package-win` and for linux run `npm run package-linux`. This will create a folder in `executables` for the windows executable version. Beware, that it overwrites this folder, should this folder already exist
5. Go into the generated folder and run `Johnny.exe` to start
This edited version can be viewed at [https://tobisma.github.io/johnny](https://tobisma.github.io/johnny)
