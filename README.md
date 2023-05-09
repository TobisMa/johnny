# johnny - original
Simulation of a von neumann arcitecture

The programm is hosted by inf-schule.de
https://inf-schule.de/content/7_rechner/3_johnny/johnny2/

With the hosting at inf-schule.de it does take some time for them to apply new versions and bugfixes. As such there is also a Github page at:
https://laubersheini.github.io/johnny
which automatically updates as soon as i make a commit to the master branch of this repo so it should always be more up to date.

# johnny - modifications
## johnny changes
This edited version can be viewed at [https://tobisma.github.io/johnny](https://tobisma.github.io/johnny)
- implement a button to insert a row above the current selection
- delete selected row
- when selecting an address row, make the value available to edit directly in the input field
- focus the input on selection of an address
- intelligent number reading when editing RAM values (e. g. `1.3` is understood as `01.003` which would be `TAKE 003`) 
- fixing some issues when resizing the page
- made electron packagable
- implemented shortcuts for menu bar and ram moving
- implemented VIM style shortcuts for buttons
- remember execution speed
- only allow writing numbers in input fields
- remember configured execution speed
- more intuitive scroll behaviour
- settings
    - turn on/off correcting RAM macro commands on insert/delete row
    - configure how many lines if available should be above/below the selection while scrolling using arrows keys or <kbd>j</kbd><kbd>k</kbd>

## shortcuts
### basic shortcuts for menu and RAM
| Key | Action | Key meaining |
| :--- | :--- | :--- |
| <kbd>E</kbd> | Reset & Execute Program | Execute |
| <kbd>R</kbd> | Reset | Reset |
| <kbd>S</kbd> | Execute one macro step | Step |
| <kbd>P</kbd> | Pause execution | Pause |
| <kbd>⇧ Shift</kbd><kbd>S</kbd> | Execute one micro step | Step |
| <kbd>↑</kbd> | Move one up in RAM | |
| <kbd>↓</kbd> | Move one down in RAM | |
| <kbd>K</kbd> | Move one up in RAM | _Vim keybinding_ |
| <kbd>J</kbd> | Move one down in RAM | _Vim keybinding_ |
| <kbd>U</kbd> | Toggle control unit view | Unit |
| <kbd>+</kbd> | Make execution faster | |
| <kbd>-</kbd> | Make execution slower | |
| <kbd>Alt</kbd><kbd>C</kbd> | Clear Ram | Clear |
| <kbd>⌥ Option</kbd><kbd>C</kbd> | Clear RAM | Clear |
| <kbd>:</kbd> | Enter command mode for buttons | _Vim keybinding_ | 
| <kbd>v</kbd> | Enter command mode for buttons | Vim |
| <kbd>D</kbd> | Focus Data bus input | Data Bus |
| <kbd>A</kbd> | Focus Address bus input | Address Bus |
| <kbd>W</kbd> | Focus RAM row input | Write (to RAM) |
| <kbd>Insert</kbd> | Insert row above current selected row in RAM | Insert |
| <kbd>Del</kbd> | Remove current selected row in RAM | Delete |

### shortcuts for buttons like `ram --> db`
Those shortcuts are in VIM style meaning you need to enter command mode first by pressing <kbd>:</kbd> or <kbd>v</kbd>.
Afterwards you type the commmand from the list below. Then press <kbd>⏎ Enter</kbd> to emulate pressing the button. While in command mode you can press <kbd>Esc</kbd> or <kbd>Ctrl</kbd><kbd>C</kbd>. While in command mode all basic shortcuts above are disabled.
The visual feedback is in command mode in the bottom left corner

#### List of commands in command mode
| Command | Button | Meaning & Notes |
| :--- | :--- | --- |
| `a` | `ManuellAb` |
| `a+` | `acc++` |
| `a++` | `acc++` |
| `a-` | `acc--` |
| `a--` | `acc--` |
| `a0` | `acc:=0` |
| `ar` | `acc:=0` |
| `i` | `Insert Row` | Inserts always above selection (like in vim before the cursor) |
| `dr` | `db --> ram` |
| `rd` | `ram --> db` |
| `d` | `ManuellDb` |
| `da` | `db --> acc` |
| `p` | `plus` | plus |
| `s` | `minus` | subtract |
| `ad` | `acc --> db` |
| `di` | `db --> ins` |

#### List of commands for the control unit
NOTE: they are also working when the control unit is not visible

| Command | Button | Meaning 
| --- | --- | --- |
| `im` | `ins --> mc` |
| `ip` | `ins --> pc` |
| `ia` | `ins --> ab` |
| `pa` | `pc --> ab` |
| `p+` | `pc++` |
| `p++` | `pc++` |
| `=0` | `=0:pc++` |
| `m0` | `mc:=0` |
| `stop` | `stop` |
| `h` | `stop` | HALT program |


#### List of commands for menu bar
| Command | Button |
| --- | --- |
| `lr` | _Load RAM_ |
| `lm` | _Load microcode_ |
| `sr` | _Save RAM_ |
| `sm` | _Save microcode_ |
| `cr` | _Clear Ram_ |
| `cm` | _Clear microcode_ |


### How to remember them?
They are made of "operators":
| Operator | Meaning(s) | Type |
| --- | --- | --- |
| `a` | `Accumulator`, `Address Bus` | _Destination_ |
| `d` | `Data Bus` | _Destination_ |
| `r` | `Ram` | _Destination_ |
| `p` | `Program counter` | _Destination_ |
| `i` | `Instruction Register` | _Destination_ |
| `m` | `Micro code` | _Location_ |
| `l` | _`Load`_ | _Action_ |
| `s` | _`Save`_ | _Action_ |
| `c` | _`Clear`_ | _Action_ |

By putting them together buttons like `ram --> db` are represented as `rd` with the meaning from `r`(ram) to `d`(data bus).

Adding `+` or `-` causes counting buttons to be triggered. For example `p+` means to add to the program counter. An alias would be `p++`. Just for the case someone types two `+`. In a context like `a+` the `a` stands for `Accumulator` instead of `Address Bus` because there are no counting buttons for the address bus.


## browser compatibility
I recommend to use Firefox (continue reading for the reason).  
This website works on Firefox and chromium based browsers (Edge, Chrome, ...). Not listed browsers have not been tested which does not mean they are not compatible.

NOTE: If the dataset gets larger the time to update the RAM rows becomes longer. But it has been fixed, so that chromium base browser only need ~500ms instead of 3.5sec

## package using electron
1. Clone the repository locally and move into the folder
2. Run `npm install`
3. Make sure `npx` is globally accessable, otherwise edit either package.json to match your requirements or install npx
4. For Windows run `npm run package-win` and for linux run `npm run package-linux`. This will create a folder in `executables` for the windows or linux executable version. Beware, that it overwrites this folder, should this folder already exist and it is always for the `x64` arcitecture. To change that behaviour, edit the `package.json` file
5. Go into the generated folder and run `Johnny.exe` to start the app
