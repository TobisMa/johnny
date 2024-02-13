# johnny - documentation
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
    - configure how many lines if available should be above/below the selection while scrolling using arrows keys or <kbd>j</kbd> <kbd>k</kbd>
- undo/redo on <kbd>Ctrl</kbd> <kbd>Z</kbd> and <kbd>Ctrl</kbd> <kbd>Y</kbd> &emsp;
- setting to configure how many actions are remembered
- prompt when saving RAM or micro code in a file
- documentation of the micro code numbers in the downloadable file
- editing already recorded micro instructions
- renaming macro codes in the microcode registers
- checking for name collision
- no multiple additions to the macro code selection
- better numbering system for where to start the new macro code


## overview about the numbers used in a *.mc file
| Number | Corresponding button |
| :---: | :--- |
| 0 | `no instruction` |
| 1 | `db --> ram` |
| 2 | `ram --> db` |
| 3 | `db --> ins` |
| 4 | `ins --> ab` |
| 5 | `ins --> mc` |
| 6 | _none_ |
| 7 | `mc:=0` |
| 8 | `pc --> ab` |
| 9 | `pc++` |
| 10 | `=0?pc++` |
| 11 | `ins --> pc` |
| 12 | `acc:=0` |
| 13 | `plus` |
| 14 | `minus` |
| 15 | `acc --> db` |
| 16 | `acc++` |
| 17 | `acc--` |
| 18 | `db --> acc` |
| 19 | `stop` |

_Made by [Sagalim](https://github.com/Sagalim) and [Isabell05](https://github.com/isabell05)_


## how does single micro code instruction editing work?
To get the menu for editing you need to make a click on the entry in the micro code table.
Then, an prompt pops up asking for a number or a button. The numbers are the micro code instrcution numbers listed in the table above. When clicking on the input field a list with possible optinos will show. 

The buttons are text input. They are parsed by checking the start of the input and the end.
You can either just type out the full button like `db --> ram` or continue reading to understand how to shorten your buttons. The numbers are the shortest way, but also the most complicated. As always, there are exceptions. Those are listed at the end.

Buttons are built using the following operators and destinations:
### Destinations
| Destination | Component |
| :--- | :--- |
| `ram` | `RAM` |
| `db` | `Data Bus` |
| `mc` | `micro code` |
| `ins` | `instruction register` |
| `pc` | `program counter` |
| `acc` | `accumulator` |

### Operators
Operators are always used after an _`Destination`_

| Operator | Meaning |
| :--- | :--- |
| `+` | increase the destination by one if such an button exists (e. g. `pc+` for `pc++`) |
| `-` | same as the `+`-operator but for decreasing |
| `0` | reset the destination to zero (e. g. `acc0` means `acc:=0`)

### how to build your buttons
#### from destination to destination
just type the first destination (the starting point) followed by the second destination. For example, `dbram` would translate to `db --> ram` or `insab` would translate to `ins --> ab`. As mentioned in the beginning typing `db --> ram` works fine as well, because it still starts with `db` and ends with `ram`.

#### destination prepended to an operator
Examples: `acc-`, `pc+`, `mc0`  
`acc-` and `pc+` just mean `acc++` and `pc++`. It is just an character shorter  
`mc0` is a bit more complicated but button inputs ending on `0` mean to reset the _destination_. So, `mc0` refers to `mc:=0` and `acc0` would be `acc:=0`.

### The exceptions

| Input | Corresponding button | Example inputs, which are valid for the button| 
| :--- | :--- | --- |
| `plus` | `plus` | |
| `minus` | `minus` | |
| ^`sub` | `minus` | `subtract` |
| `stop` | `stop` | |
| ^`=`$`+` | `=0?pc++` | `=0?+`, `=+`, `=0?pc+` | 

---
> - `^` prepended to a code block signals that the input needs to start with this code block
> - `$` prepended to a code block signals that the input needs to end on that code block  
> ---
> For example `^'ram' $'db'` describes that the input needs to start with `ram` and needs to end with `db`. This input corresponds to the button `ram --> db`
---


## shortcuts
### basic shortcuts for menu and RAM
Actions on RAM which are possible from micro code, as well (e. g. save) are with perssing <kbd>⇧ Shift</kbd> additionally.

| Key | Action | Key meaining & Notes |
| :--- | :--- | :--- |
| <kbd>E</kbd> | Reset & Execute Program | Execute |
| <kbd>R</kbd> | Reset | Reset |
| <kbd>S</kbd> | Execute one macro step | Step |
| <kbd>P</kbd> | Pause execution | Pause |
| <kbd>⇧ Shift</kbd> <kbd>S</kbd> | Execute one micro step | Step |
| <kbd>↑</kbd> | Move one up in RAM | |
| <kbd>↓</kbd> | Move one down in RAM | |
| <kbd>K</kbd> | Move one up in RAM | _Vim keybinding_ |
| <kbd>J</kbd> | Move one down in RAM | _Vim keybinding_ |
| <kbd>U</kbd> | Toggle control unit view | Unit |
| <kbd>+</kbd> | Make execution faster | |
| <kbd>-</kbd> | Make execution slower | |
| <kbd>Alt</kbd> <kbd>C</kbd> | Clear Ram | Clear |
| <kbd>⌥ Option</kbd> <kbd>C</kbd> | Clear RAM | Clear |
| <kbd>Alt</kbd> <kbd>⇧ Shift</kbd> <kbd>C</kbd> | Reset micro code | _Clear_ |
| <kbd>⌥ Option</kbd> <kbd>⇧ Shift</kbd> <kbd>C</kbd> | Reset micro code | _Clear_ |
| <kbd>:</kbd> | Enter command mode for buttons | _Vim keybinding_ | 
| <kbd>v</kbd> | Enter command mode for buttons | Vim |
| <kbd>D</kbd> | Focus Data bus input | Data Bus |
| <kbd>A</kbd> | Focus Address bus input | Address Bus |
| <kbd>W</kbd> | Focus RAM row input | Write (to RAM) |
| <kbd>Insert</kbd> | Insert row above current selected row in RAM | Insert |
| <kbd>⇧ Shift</kbd> <kbd>Del</kbd> | Remove current selected row in RAM | Delete |
| <kbd>⇧ Shift</kbd> <kbd>A</kbd> | Focus the address input for custom macro codes | Address (and Shift because microcode) |
| <kbd>⇧ Shift</kbd> <kbd>N</kbd> | Focus the name input for custom micro codes | Name (and Shift because microcode) |
| <kbd>⇧ Shift</kbd> <kbd>Q</kbd> | record a microcode | _as in vim macros_ (you are recording a macrocode after all xD) |
| <kbd>⇧ Shift</kbd> <kbd>Enter</kbd>| record a microcode | works only in the input fields for address and name of a custom makrocode. Exists because <kbd>⇧ Shift</kbd><kbd>Q</kbd> will be disabled |
| <kbd>Del</kbd> | Remove current selected row in RAM | Delete (disabled per default; change in settings) |
| <kbd>⌃ Ctrl</kbd> <kbd>O</kbd> | Opening RAM file from disk | Open |
| <kbd>⌃ Ctrl</kbd> <kbd>⇧ Shift</kbd> <kbd>O</kbd> | Opening micro code file from disk | Open |
| <kbd>⌃ Ctrl</kbd> <kbd>S</kbd> | Saving current RAM to file | Save |
| <kbd>⌃ Ctrl</kbd> <kbd>⇧ Shift</kbd> <kbd>S</kbd> | Saving current micro code to file | Save |

### shortcuts for buttons like `ram --> db`
Those shortcuts are in VIM style meaning you need to enter command mode first by pressing <kbd>:</kbd>(VIM keybinding) or <kbd>V</kbd> (added by this website).
Afterwards you type the commmand from the list below. Then press <kbd>⏎ Enter</kbd> to emulate pressing the button. While in command mode you can press <kbd>Esc</kbd> or <kbd>^ Ctrl</kbd> <kbd>C</kbd> to leave command mode. While in command mode all basic shortcuts above are disabled.
The visual feedback is in command mode in the bottom left corner.

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
| `=0` | `=0?pc++` |
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
| `rec` | _Record micro code_ |
| `cnf` | _Open settings_ |

### How to remember them?
They are made of "operators" (and similar to the buttons read when editing micro instructions):
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
