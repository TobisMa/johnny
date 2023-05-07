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
- implemented shortcuts for menu bar and ram moving
- implemented VIM style shortcuts for buttons

## shortcuts
### basic shortcuts for menu and RAM
| Key | Action |
| :--- | :--- | 
| <kbd>E</kbd> | Reset & Execute Program |
| <kbd>R</kbd> | Reset |
| <kbd>S</kbd> | Execute one macro step |
| <kbd>P</kbd> | Pause execution |
| <kbd>⇧ Shift</kbd><kbd>S</kbd> | Execute one micro step |
| <kbd>↑</kbd> | Move one up in RAM |
| <kbd>↓</kbd> | Move one down in RAM |
| <kbd>K</kbd> | Move one up in RAM |
| <kbd>J</kbd> | Move one down in RAM |
| <kbd>U</kbd> | Toggle control unit view |
| <kbd>+</kbd> | Make execution faster |
| <kbd>-</kbd> | Make execution slower |
| <kbd>Alt</kbd><kbd>C</kbd> | Clear Ram |
| <kbd>⌥ Option</kbd><kbd>C</kbd> | Clear RAM |
| <kbd>:</kbd> | Enter command mode for buttons |
| <kbd>v</kbd> | Enter command mode for buttons |
| <kbd>D</kbd> | Focus Data bus input |
| <kbd>A</kbd> | Focus Address bus input |
| <kbd>W</kbd> | Focus RAM row input |

### shortcuts for buttons like `ram --> db`
Those shortcuts are in VIM style meaning you need to enter command mode first by pressing <kbd>:</kbd> or <kbd>v</kbd>.
Afterwards you type the commmand from the list below. Then press <kbd>⏎ Enter</kbd> to emulate pressing the button. While in command mode you can press <kbd>Esc</kbd> or <kbd>Ctrl</kbd><kbd>C</kbd>. While in command mode all basic shortcuts above are disabled.

NOTE: Currently, visual feedback is still missing. Use Dev Tools to view what is happening in command mode.

#### List of commands in command mode
| Command | Button |
| :--- | :--- |
| `a` | `ManuellAb` |
| `a+` | `acc++` |
| `a++` | `acc++` |
| `a-` | `acc--` |
| `a--` | `acc--` |
| `a0` | `acc:=0` |
| `ar` | `acc:=0` |
| `i` | `Insert Row` |
| `dr` | `db --> ram` |
| `rd` | `ram --> db` |
| `d` | `ManuellDb` |
| `da` | `db --> acc` |
| `p` | `plus` |
| `s` | `minus` |
| `ad` | `acc --> db` |
| `di` | `db --> ins` |

#### List of command for the control unit
NOTE: they are also working when the control unit is not visible

| Command | Button |
| --- | --- |
| `im` | `ins --> mc` |
| `ip` | `ins --> pc` |
| `ia` | `ins --> ab` |
| `pa` | `pc --> ab` |
| `p+` | `pc++` |
| `p++` | `pc++` |
| `=0` | `=0:pc++` |
| `m0` | `mc:=0` |
| `stop` | `stop` |
| `h` | `stop`


## browser compatibility
I recommend to use Firefox (continue reading for the reason).  
This website works on Firefox and chromium based browsers (Edge, Chrome, ...). Not listed browsers have not been tested which does not mean they are not compatible.

NOTE: If the dataset gets larger the time to update the RAM rows becomes longer

## package using electron
1. Clone the repository locally and move into the folder
2. Run `npm install`
3. Make sure `npx` is globally accessable, otherwise edit either package.json to match your requirements or install npx
4. For Windows run `npm run package-win` and for linux run `npm run package-linux`. This will create a folder in `executables` for the windows or linux executable version. Beware, that it overwrites this folder, should this folder already exist and it is always for the `x64` arcitecture. To change that behaviour, edit the `package.json` file
5. Go into the generated folder and run `Johnny.exe` to start the app
