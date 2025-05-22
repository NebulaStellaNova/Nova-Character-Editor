import Xml;
import Type;
import Reflect;
import haxe.Json;
import StringTools;
import flixel.FlxG;
import funkin.Paths;
import funkin.Assets;
import flixel.FlxCamera;
import flixel.FlxSprite;
import flixel.FlxObject;
import funkin.ui.AtlasText;
import flixel.math.FlxMath;
import flixel.text.FlxText;
import funkin.input.Cursor;
import funkin.util.FileUtil;
import funkin.util.MathUtil;
import openfl.net.FileFilter;
import funkin.util.WindowUtil;
import funkin.util.ReflectUtil;
import funkin.input.CursorMode;
import funkin.audio.FunkinSound;
import funkin.ui.MusicBeatState;
import haxe.ui.components.DropDown;
import funkin.graphics.FunkinSprite;
import funkin.modding.PolymodHandler;
import flixel.text.FlxTextBorderStyle;
import haxe.ui.backend.flixel.UIState;
import haxe.ui.RuntimeComponentBuilder;
import funkin.ui.mainmenu.MainMenuState;
import haxe.ui.containers.windows.Window;
import funkin.modding.module.ModuleHandler;
import haxe.ui.containers.windows.WindowManager;
import funkin.modding.base.ScriptedMusicBeatState;



import haxe.ui.components.NumberStepper;
import haxe.ui.components.CheckBox;
import haxe.ui.components.Button;
import haxe.ui.components.TextArea;
import haxe.ui.components.Label;
import haxe.ui.components.TextField;
import haxe.ui.containers.HBox;
import haxe.ui.core.Component;
import haxe.ui.core.TextDisplay;
import haxe.ui.macros.ComponentMacros;

class CharacterEditor extends MusicBeatState {
    
    var FILE_FILTER_XML:FileFilter = new FileFilter("Codename Character File", "*.xml");

    var Converters;

    var editorVersion = "v0.1.3";

    var windowTitleSuffix = "";
    var windowTitlePrefix = "";
    
    var unsavedChanges = false;

    var bg:FunkinSprite;

    //var paths:String = 'mods/Nova Character Editor/';

    var camCHAR;
    var camHUD;

    var buttons = [];
    var callbacks = [];
    var dropdowns = [];
    var forceHidden = [];
    var mods = [];
    var realDropDowns = [];

    var animCallbacks = [];
    var animButtons = [];

    var animationsDropdown = {
        open: false,
        buttons: []
    };

    var disableInput = false;

    var onionSkin:BaseCharacter;
    var curChar:BaseCharacter;
    var curCharFile;
    var charFiles = [];

    var infoText:FlxText;
    var controlsText:FlxText;

    var curAnimText:FlxText;

    var curCharacter = "";

    var currentPath = "";
    var currentFolder = "??";
    var paths = [];
    
    var windows = [];

    var daHeightThing = 0;

    /*function getPath(file:String) {
        return paths + file;
    }*/

    /**
     * Shortcut to parse a JSON string
     * @param str JSON contents as string.
     * @return Parsed JSON
    */
    public function parseJsonString(str:String) {
        return Json.parse(str);
    }

    /**
     * Shortcut to parse a JSON file
     * @param path  Path to the JSON file
     * @return Parsed JSON
    */
    public function parseJsonFile(path:String) {
        var daString = FileUtil.readStringFromPath(path);
        if (daString == null || daString == "") {
            return null;
        } else {
            return parseJsonString(daString);
        }
    }

    function checkFileExists(path:String) {
        return Assets.exists(path);
    }

    function new(){
        super('CharacterEditor');
        h = FlxG.height;
        w = FlxG.width;
    }
        
    var windowManager = new WindowManager();

    function openWindow(title:String, children:Array, ?width, ?height, ?color) {
        var window = new Window();
        
        if (color != null) {
            window.color = color;
        }

        for (i in windows) {
            if (i.title == title) {
                i.windowManager.closeWindow(i);
                return window;
            }
        }
        
        FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        
        window.windowManager = windowManager;

        window.title = title;
        window.x = 200;
        window.y = 200;
        if (width != null) {
            window.width = width;
        }
        if (height != null) {
            window.height = height;
        }
        //window.draggable = true;
        window.maximizable = false;
        window.minimizable = false;
        window.collapsable = false;
        for (child in children) {
            window.addComponent(child);
        }
        windows.push(window);
        add(window);
        return window;
    }

    function getButton(x:Int = 0, y:Int = 0, title:String, callback = ()->{}, ?width, ?forceHide = false, ?height, ?skipCallback=false) {
        var button = new Button();
        button.text = title;
        trace(button.fontFamily, button.text);
        button.allowFocus = true;
        button.allowInteraction = true;
        button.marginLeft = x;
        button.marginTop = y;
        if (width != null) {
            button.width = width;
        }
        if (height != null) {
            button.height = height;
        }
        if (!skipCallback) {
            callbacks.push(callback);
        }
        forceHidden.push(forceHide);
        return button;
    }

    var curView = "SPRITESHEET";

    function sortDropdownAlphabetically(a, b) {
        a = a.text.toUpperCase();
        b = b.text.toUpperCase();

        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }

    var textFields = [];

    function create() {
        super.create();

        FunkinSound.playMusic("chartEditorLoop", {startingVolume: 0, overrideExisting: true, restartTrack: false, persist: true, loop: true});
        FlxG.sound.music.fadeIn(0.5 /* Duration */, 0, 1);

        //var currentFolder = "??";
        for (mod in PolymodHandler.getAllMods()) {
            var meta = parseJsonFile("mods/" + mod.id + "/_polymod_meta.json");
            if (meta.title == "Nova Character Editor") {
                currentFolder = mod.id;
                break;
            }
        }

        Converters = ModuleHandler.getModule("NovaConverters");

        Cursor.show();

        bg = new FunkinSprite(0, 0).loadGraphic(Paths.image('menuDesat'));
        bg.scrollFactor.set(0, 0);
        bg.setGraphicSize(Std.int(bg.width * 1.2));
        bg.updateHitbox();
        bg.screenCenter();
        add(bg);

        camCHAR = new FlxCamera();
        camCHAR.bgColor = 0x00000000;
        FlxG.cameras.add(camCHAR, false);

        camHUD = new FlxCamera();
        camHUD.bgColor = 0x00000000;
        FlxG.cameras.add(camHUD, false);

        onionSkin = new FunkinSprite();
        onionSkin.cameras = [camCHAR];
        onionSkin.alpha = 0.5;
        add(onionSkin);
        curChar = new FunkinSprite();
        curChar.cameras = [camCHAR];
        add(curChar);

        var mainView:Component = new Component();
        mainView.cameras = [camHUD];
        this.add(mainView);

        
        var button = getButton(10, 10, "File", ()-> {
            dropdowns[0].open = !dropdowns[0].open;
            //FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        }, 75);
        buttons.push(button);
        
        var button = getButton(100, 10, "Character", ()-> {
            trace("ran");
            var buttons = [];
            dropdowns[1].open = !dropdowns[1].open;
            
            //FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        }, 150);
        buttons.push(button);

        var button = getButton(265, 10, "Tools", ()-> {
            dropdowns[2].open = !dropdowns[2].open;
            //FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        }, 170);
        buttons.push(button);

        var button = getButton(FlxG.width - 215, 10, "Characters", ()-> {
            //dropdowns[3].open = !dropdowns[3].open;
            var buttons = [];
            var addedMods = [];
            for (i in mods) {
                if (!addedMods.contains(i)) {
                    var dropDown = new DropDown();
                    dropDown.text  = i;
                    dropDown.width = 165;
                    dropDown.searchable = true;
                    dropDown.onChange = ()-> {
                        var charIndex = 0;
                        for (charFile in charFiles) {
                            if (charFile.name == dropDown.text) {
                                loadCharacter(charFile, paths[charIndex]);
                                FunkinSound.playOnce(Paths.sound("chartingSounds/noteLay"), 1);
                                for (i in windows) {
                                    i.windowManager.closeWindow(i);
                                }
                            }
                            charIndex++;
                        }
                    }
                    realDropDowns.push(dropDown);
                    buttons.push(dropDown);
                    addedMods.push(i);
                }
            }
            var index = 0;
            for (charFile in charFiles) {
                if (charFile != null) {
                    var daButton = new Button();
                    daButton.text = charFile.name;
                    daButton.onClick = ()-> {
                        trace(charFile);
                        var path;
                        var charIndex = 0;
                        for (i in charFiles) {
                            if (i.name == charFile.name) {
                                path = paths[charIndex];
                                break;
                            }
                            charIndex++;
                        }
                        loadCharacter(charFile, paths[charIndex]);
                        FunkinSound.playOnce(Paths.sound("chartingSounds/noteLay"), 1);
                        for (i in windows) {
                            i.windowManager.closeWindow(i);
                        }
                        
                    };
                    daButton.width = 165;
                    buttons[addedMods.indexOf(mods[index])].dataSource.add({text: charFile.name, onChange: daButton.onClick});
                    //buttons.push(daButton);
                }   
                index++;
            }
            for (i in buttons) {
                i.dataSource.sort(sortDropdownAlphabetically);
            }
            var window = openWindow("Select Character", buttons);
            window.x = FlxG.width - 215;
            window.y = 32;
            window.width = 200;
            
                
            
            //FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        }, 200);
        buttons.push(button);

        var button = getButton(450, 10, "Converters", ()-> {
            dropdowns[5].open = !dropdowns[5].open;
            //FunkinSound.playOnce(Paths.sound("chartingSounds/openWindow"), 1);
        }, 200);
        buttons.push(button);

        // File \\
        dropdowns.push({
            open: false,
            buttons: [
                getButton(10, 32, "New", ()-> {
                    newCharacter();
                }, 75),
                getButton(10, 32 + (22), "Save", ()-> {
                    saveCharacter();
                    var children = [];
                    var path = "";
                    var charIndex = 0;
                    for (i in charFiles) {
                        path = paths[charIndex];
                        charIndex++;
                    }
                    loadCharacter(curCharFile, path);
                    var lines = [
                        "Saved character: " + curCharFile.name,
                        "At: " + path
                    ];
                    for (i in lines) {
                        var label = new Label();
                        label.text = i;
                        children.push(label);
                    }
                    
                    

                    var ok = new Button();
                    ok.text = "Ok";
                    
                    ok.color = 0xFF00FF00;


                    var box = new HBox();
                    box.addComponent(ok);
                    children.push(box);
                    
                    var daWindow = openWindow("Saved Character!", children, null, null, 0xFF00FF00);
                    daWindow.screenCenter();
                    ok.onClick = ()->{
                        daWindow.windowManager.closeWindow(daWindow);
                        FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
                    }
                }, 75),
                getButton(10, 32 + (22*2), "Save As", ()-> {
                    saveCharacterAs();
                }, 75)
                getButton(10, 32  + (22*3), "Exit", ()-> {
                    if (!unsavedChanges) {
                        FlxG.switchState(new MainMenuState());
                    } else {
                        var children = [];
                        var lines = [
                            "Your changes will be lost",
                            "if you don't save them.",
                            "(Can't be recovered)",
                            "",
                            "Would you like to cancel?"
                        ];
                        for (i in lines) {
                            var label = new Label();
                            label.text = i;
                            children.push(label);
                        }
                        

                        var cancel = new Button();
                        cancel.text = "Cancel";
                        cancel.onClick = ()->{
                            windows[windows.length-1].windowManager.closeWindow(windows[windows.length-1]);
                        }
                        cancel.color = 0xFFFFFF00;

                        var exitToMenu = new Button();
                        exitToMenu.text = "Exit To Menu";
                        exitToMenu.onClick = ()->{
                            FlxG.switchState(new MainMenuState());
                        }
                        exitToMenu.color = 0xFFFF0000;

                        var saveAndExit = new Button();
                        saveAndExit.text = "Save & Exit To Menu";
                        saveAndExit.onClick = ()->{
                            saveCharacter();
                            FlxG.switchState(new MainMenuState());
                        }
                        saveAndExit.color = 0xFF00FF00;

                        var box = new HBox();
                        box.addComponent(cancel);
                        box.addComponent(exitToMenu);
                        box.addComponent(saveAndExit);
                        children.push(box);
                        
                        var daWindow = openWindow("Unsaved Changes! (This may be incorrect)", children, null, null, 0xFFFF0000);
                        daWindow.screenCenter();
                    }
                }, 75)
            ]
        });

        // Character \\ 
        dropdowns.push({
            open: false,
            buttons: [
                getButton(100, 32, "New Animation", ()-> {
                    // -- Name -- \\
                    var nameLabel = new Label();
                    nameLabel.text = "Name:";
                    nameLabel.marginTop = 7;
                    //nameLabel.width = 70;
                    
                    var name = new TextField();
                    name.placeholder = "...";
                    name.color = 0xFFaaaaaa;
                    textFields.push(name);

                    var nameBox = new HBox();
                    nameBox.addComponent(nameLabel);
                    nameBox.addComponent(name);

                    // -- Name -- \\
                    var prefixLabel = new Label();
                    prefixLabel.text = "Prefix:";
                    prefixLabel.marginTop = 7;
                    //prefixLabel.width = 70;
                    
                    var prefix = new TextField();
                    prefix.placeholder = "...";
                    prefix.color = 0xFFaaaaaa;
                    textFields.push(prefix);

                    var prefixBox = new HBox();
                    prefixBox.addComponent(prefixLabel);
                    prefixBox.addComponent(prefix);

                    var okButton = new Button();
                    okButton.text = "OK";
                    okButton.onClick = ()->{
                        var daAnimation = {
                            name: name.text,
                            prefix: prefix.text,
                            offsets: [ 0, 0 ],
                            frameRate: 24,
                            looped: false,
                            flipX: false,
                            flipY: false
                        };
                        curCharFile.animations.push(daAnimation);
                        loadCharacter(curCharFile, null, true);
                        prefix.focus = false;
                        name.focus = false;
                        windows[windows.length-1].windowManager.closeWindow(windows[windows.length-1]);
                    };


                    var window = openWindow("New Animation", [nameBox, prefixBox, okButton]);
                    window.screenCenter();
                }, 150),
                getButton(100, 32 + (22), "Edit Animation", ()-> {

                    var curAnim = getCurAnimData();
                    if (curAnim.flipX = null) {
                        curAnim.flipX = false;
                    }
                    if (curAnim.flipY = null) {
                        curAnim.flipY = false;
                    }
                    // -- Name -- \\
                    var nameLabel = new Label();
                    nameLabel.text = "Name:";
                    nameLabel.marginTop = 7;

                    var name = new TextField();
                    name.text = curAnim.name;
                    name.color = 0xFFaaaaaa;
                    name.onChange = ()->{
                        curAnim.name = name.text;
                        loadCharacter(curCharFile, null, true);
                    }
                    textFields.push(name);

                    var nameBox = new HBox();
                    nameBox.addComponent(nameLabel);
                    nameBox.addComponent(name);
                    
                    // -- Prefix -- \\
                    var prefixLabel = new Label();
                    prefixLabel.text = "Prefix:";
                    prefixLabel.marginTop = 7;

                    var prefix = new TextField();
                    prefix.text = curAnim.prefix;
                    prefix.onChange = ()->{
                        curAnim.prefix = prefix.text;
                        loadCharacter(curCharFile, null, true);
                    }
                    prefix.color = 0xFFaaaaaa;
                    textFields.push(prefix);

                    var prefixBox = new HBox();
                    prefixBox.addComponent(prefixLabel);
                    prefixBox.addComponent(prefix);

                    // -- Indices -- \\
                    var frameIndicesLabel = new Label();
                    frameIndicesLabel.text = "Indices:";
                    frameIndicesLabel.marginTop = 7;

                    var frameIndices = new TextField();
                    frameIndices.text = curAnim.frameIndices != null ? curAnim.frameIndices.join(",") : "";
                    frameIndices.onChange = ()->{
                        if (frameIndices.text != "") {
                            curAnim.frameIndices = [];
                            for (i in frameIndices.text.split(",")) {
                                curAnim.frameIndices.push(Std.parseInt(i));
                            }
                        } else {
                            curAnim.frameIndices = null;
                        }
                        loadCharacter(curCharFile, null, true);
                    }
                    frameIndices.color = 0xFFaaaaaa;
                    textFields.push(frameIndices);

                    var frameIndicesBox = new HBox();
                    frameIndicesBox.addComponent(frameIndicesLabel);
                    frameIndicesBox.addComponent(frameIndices);

                    // -- Offsets -- \\

                    if (curAnim.offsets == null) {
                        curAnim.offsets = [
                            0,
                            0
                        ];
                    }

                    var offsetsLabel = new Label();
                    offsetsLabel.text = "Offsets:";
                    offsetsLabel.marginTop = 7;

                    var xStepper = new NumberStepper();
                    xStepper.step = 1;
                    xStepper.pos = curAnim.offsets != null ? curAnim.offsets[0] : 0;
                    xStepper.width = 65;
                    xStepper.onChange = ()->{
                        curAnim.offsets[0] = xStepper.pos;
                    }
                    textFields.push(xStepper);
                    
                    var yStepper = new NumberStepper();
                    yStepper.step = 1;
                    yStepper.pos = curAnim.offsets != null ? curAnim.offsets[1] : 0;
                    yStepper.width = 65;
                    yStepper.onChange = ()->{
                        curAnim.offsets[1] = yStepper.pos;
                    }
                    textFields.push(yStepper);


                    var offsetsBox = new HBox();
                    offsetsBox.addComponent(offsetsLabel);
                    offsetsBox.addComponent(xStepper);
                    offsetsBox.addComponent(yStepper);

                    // -- Looped -- \\
                    var loopedCheck = new CheckBox();
                    loopedCheck.selected = curAnim.looped != null ? curAnim.looped : false;
                    loopedCheck.onChange = ()->{
                        curAnim.looped = loopedCheck.selected;
                        loadCharacter(curCharFile, null, true);
                    }

                    var loopedLabel = new Label();
                    loopedLabel.text = "Looped:";
                    loopedLabel.marginTop = 5;

                    var loopedBox = new HBox();
                    loopedBox.addComponent(loopedLabel);
                    loopedBox.addComponent(loopedCheck);


                    var window = openWindow("Edit Animation", [nameBox, prefixBox, frameIndicesBox, offsetsBox, loopedBox]);
                    window.screenCenter();

                }, 150),
                getButton(100, 32 + (22*2), "Delete Cur Animation", ()-> {
                    deleteCurAnim();
                }, 150),
                getButton(100, 32  + (22*3), "Edit Character Info", ()-> {
                    var daWindow;
                    var healthIconButton = new Button();
                    healthIconButton.text = "Icon Properties";
                    healthIconButton.onClick = ()->{
                        // -- ID -- \\
                        var idLabel = new Label();
                        idLabel.text = "Name:";
                        idLabel.marginTop = 7;
                        //idLabel.width = 70;
                        
                        var id = new TextField();
                        if (curCharFile.healthIcon == null) {
                            curCharFile.healthIcon = {
                                id: "face",
                                offsets: [0, 0],
                                scale: 1,
                                isPixel: false,
                                flipX: false,
                                flipY: false
                            }
                            prevCharFile.healthIcon = {
                                id: "face",
                                offsets: [0, 0],
                                scale: 1,
                                isPixel: false,
                                flipX: false,
                                flipY: false
                            }
                        }
                        id.text = curCharFile.healthIcon.id != null ? curCharFile.healthIcon.id : "face";
                        id.onChange = ()->{
                            curCharFile.healthIcon.id = id.text;
                        }
                        id.color = 0xFFaaaaaa;
                        textFields.push(id);

                        var idBox = new HBox();
                        idBox.addComponent(idLabel);
                        idBox.addComponent(id);

                        // -- Flip X -- \\
                        var flipXCheck = new CheckBox();
                        flipXCheck.selected = curCharFile.healthIcon.flipX != null ? curCharFile.healthIcon.flipX : false;
                        flipXCheck.onChange = ()->{
                            curCharFile.healthIcon.flipX = flipXCheck.selected;
                        }

                        var flipXLabel = new Label();
                        flipXLabel.text = "Flip X:";
                        flipXLabel.marginTop = 5;

                        var flipXBox = new HBox();
                        flipXBox.addComponent(flipXLabel);
                        flipXBox.addComponent(flipXCheck);
                        
                        // -- Flip Y -- \\
                        var flipYCheck = new CheckBox();
                        flipYCheck.selected = curCharFile.healthIcon.flipY != null ? curCharFile.healthIcon.flipY : false;
                        flipYCheck.onChange = ()->{
                            curCharFile.healthIcon.flipY = flipYCheck.selected;
                        }

                        var flipYLabel = new Label();
                        flipYLabel.text = "Flip Y:";
                        flipYLabel.marginTop = 5;

                        var flipYBox = new HBox();
                        flipYBox.addComponent(flipYLabel);
                        flipYBox.addComponent(flipYCheck);

                        // -- Scale -- \\
                        var scaleStepper = new NumberStepper();
                        scaleStepper.step = 0.1;
                        scaleStepper.pos = curCharFile.healthIcon.scale != null ? curCharFile.healthIcon.scale : 1;
                        scaleStepper.width = 55;
                        scaleStepper.min = 0;
                        scaleStepper.onChange = ()->{
                            curCharFile.healthIcon.scale = scaleStepper.pos;
                        }
                        textFields.push(scaleStepper);

                        var scaleLabel = new Label();
                        scaleLabel.text = "Scale:";
                        scaleLabel.marginTop = 7;

                        var scaleBox = new HBox();
                        scaleBox.addComponent(scaleLabel);
                        scaleBox.addComponent(scaleStepper);

                        // -- Offsets -- \\
                        var offsetsLabel = new Label();
                        offsetsLabel.text = "Offsets:";
                        offsetsLabel.marginTop = 7;

                        var xStepper = new NumberStepper();
                        xStepper.step = 1;
                        xStepper.pos = curCharFile.healthIcon.offsets != null ? curCharFile.healthIcon.offsets[0] : 0;
                        xStepper.width = 65;
                        xStepper.onChange = ()->{
                            curCharFile.healthIcon.offsets[0] = xStepper.pos;
                        }
                        textFields.push(xStepper);
                        
                        var yStepper = new NumberStepper();
                        yStepper.step = 1;
                        yStepper.pos = curCharFile.healthIcon.offsets != null ? curCharFile.healthIcon.offsets[1] : 0;
                        yStepper.width = 65;
                        yStepper.onChange = ()->{
                            curCharFile.healthIcon.offsets[1] = yStepper.pos;
                        }
                        textFields.push(yStepper);
                        if (curCharFile.healthIcon.offsets == null) {
                            curCharFile.healthIcon.offsets = [
                                0,
                                0
                            ];
                            prevCharFile.healthIcon.offsets = [
                                0,
                                0
                            ];
                        }

                        var offsetsBox = new HBox();
                        offsetsBox.addComponent(offsetsLabel);
                        offsetsBox.addComponent(xStepper);
                        offsetsBox.addComponent(yStepper);

                        // -- Is Pixel -- \\
                        var isPixelCheck = new CheckBox();
                        isPixelCheck.selected = curCharFile.healthIcon.isPixel != null ? curCharFile.healthIcon.isPixel : false;
                        isPixelCheck.onChange = ()->{
                            curCharFile.healthIcon.isPixel = isPixelCheck.selected;
                        }

                        var isPixelLabel = new Label();
                        isPixelLabel.text = "Is Pixel:";
                        isPixelLabel.marginTop = 5;

                        var isPixelBox = new HBox();
                        isPixelBox.addComponent(isPixelLabel);
                        isPixelBox.addComponent(isPixelCheck);

                        var window = openWindow("Icon Properties", [idBox, scaleBox, offsetsBox, isPixelBox, flipXBox, flipYBox], 350, null);
                        window.x = 4;
                        window.y = daHeightThing + 50;
                    }

                    //var test = new TextDisplay();
                    //test.htmlText = "Test: ";

                    // -- Flip X -- \\
                    var flipXCheck = new CheckBox();
                    flipXCheck.selected = curCharFile.flipX != null ? curCharFile.flipX : false;
                    flipXCheck.onChange = ()->{
                        curCharFile.flipX = flipXCheck.selected;
                    }

                    var flipXLabel = new Label();
                    flipXLabel.text = "Flip X:";
                    flipXLabel.marginTop = 5;

                    var flipXBox = new HBox();
                    flipXBox.addComponent(flipXLabel);
                    flipXBox.addComponent(flipXCheck);
                    
                    // -- Flip Y -- \\
                    var flipYCheck = new CheckBox();
                    flipYCheck.selected = curCharFile.flipY != null ? curCharFile.flipY : false;
                    flipYCheck.onChange = ()->{
                        curCharFile.flipY = flipYCheck.selected;
                    }

                    var flipYLabel = new Label();
                    flipYLabel.text = "Flip Y:";
                    flipYLabel.marginTop = 5;

                    var flipYBox = new HBox();
                    flipYBox.addComponent(flipYLabel);
                    flipYBox.addComponent(flipYCheck);

                    // -- Is Pixel -- \\
                    var isPixelCheck = new CheckBox();
                    isPixelCheck.selected = curCharFile.isPixel != null ? curCharFile.isPixel : false;
                    isPixelCheck.onChange = ()->{
                        curCharFile.isPixel = isPixelCheck.selected;
                    }

                    var isPixelLabel = new Label();
                    isPixelLabel.text = "Is Pixel:";
                    isPixelLabel.marginTop = 5;

                    var isPixelBox = new HBox();
                    isPixelBox.addComponent(isPixelLabel);
                    isPixelBox.addComponent(isPixelCheck);

                    // -- Name -- \\
                    var startingAnimationLabel = new Label();
                    startingAnimationLabel.text = "Starting Animation:";
                    startingAnimationLabel.marginTop = 7;
                    //nameLabel.width = 70;
                    
                    var startingAnimation = new TextField();
                    startingAnimation.text = curCharFile.startingAnimation != null ? curCharFile.startingAnimation : "idle";
                    startingAnimation.onChange = ()->{
                        curCharFile.startingAnimation = startingAnimation.text;
                    }
                    startingAnimation.color = 0xFFaaaaaa;
                    textFields.push(startingAnimation);

                    var startingAnimationBox = new HBox();
                    startingAnimationBox.addComponent(startingAnimationLabel);
                    startingAnimationBox.addComponent(startingAnimation);

                    // -- Name -- \\
                    var nameLabel = new Label();
                    nameLabel.text = "Name:";
                    nameLabel.marginTop = 7;
                    //nameLabel.width = 70;
                    
                    var name = new TextField();
                    name.text = curCharFile.name;
                    name.onChange = ()->{
                        curCharFile.name = name.text;
                    }
                    name.color = 0xFFaaaaaa;
                    textFields.push(name);

                    var nameBox = new HBox();
                    nameBox.addComponent(nameLabel);
                    nameBox.addComponent(name);

                    // -- ASSet Path -- \\
                    var assetPathLabel = new Label();
                    assetPathLabel.text = "Asset Path:";
                    assetPathLabel.marginTop = 7;
                    //assetPathLabel.width = 70;
                    
                    var assetPath = new TextField();
                    assetPath.text = curCharFile.assetPath;
                    trace(assetPath.color);
                    assetPath.onChange = ()->{
                        if (!checkFileExists("assets/shared/images/" + assetPath.text + ".png") && !FileUtil.fileExists("assets/shared/images/" + assetPath.text + ".png")) {
                            assetPath.color = 0xFFFF0000;
                        } else {
                            assetPath.color = 0xFFaaaaaa;
                            curCharFile.assetPath = assetPath.text;
                            loadCharacter(curCharFile, null, true);
                        }
                    }
                    assetPath.width = 200;
                    textFields.push(assetPath);

                    var assetPathBox = new HBox();
                    assetPathBox.addComponent(assetPathLabel);
                    assetPathBox.addComponent(assetPath);
        
                    // -- Sing Time -- \\
                    var singTimeStepper = new NumberStepper();
                    singTimeStepper.step = 1;
                    singTimeStepper.pos = curCharFile.singTime;
                    singTimeStepper.width = 55;
                    singTimeStepper.max = 99;
                    singTimeStepper.min = 1;
                    singTimeStepper.onChange = ()->{
                        curCharFile.singTime = singTimeStepper.pos;
                    }
                    textFields.push(singTimeStepper);

                    var singTimeLabel = new Label();
                    singTimeLabel.text = "Sing Time:";
                    singTimeLabel.marginTop = 7;

                    var singTimeBox = new HBox();
                    singTimeBox.addComponent(singTimeLabel);
                    singTimeBox.addComponent(singTimeStepper);

                    // -- Offsets -- \\
                    var offsetsLabel = new Label();
                    offsetsLabel.text = "Offsets:";
                    offsetsLabel.marginTop = 7;

                    var xStepper = new NumberStepper();
                    xStepper.step = 1;
                    xStepper.pos = curCharFile.offsets != null ? curCharFile.offsets[0] : 0;
                    xStepper.width = 65;
                    xStepper.onChange = ()->{
                        curCharFile.offsets[0] = xStepper.pos;
                    }
                    textFields.push(xStepper);
                    
                    var yStepper = new NumberStepper();
                    yStepper.step = 1;
                    yStepper.pos = curCharFile.offsets != null ? curCharFile.offsets[1] : 0;
                    yStepper.width = 65;
                    yStepper.onChange = ()->{
                        curCharFile.offsets[1] = yStepper.pos;
                    }
                    textFields.push(yStepper);
                    if (curCharFile.offsets == null) {
                        curCharFile.offsets = [
                            0,
                            0
                        ];
                    }

                    var offsetsBox = new HBox();
                    offsetsBox.addComponent(offsetsLabel);
                    offsetsBox.addComponent(xStepper);
                    offsetsBox.addComponent(yStepper);

                    // -- Dance Inteval -- \\
                    var danceStepper = new NumberStepper();
                    danceStepper.step = 1;
                    danceStepper.pos = curCharFile.danceEvery != null ? curCharFile.danceEvery : 1;
                    danceStepper.width = 55;
                    danceStepper.min = 1;
                    danceStepper.onChange = ()->{
                        curCharFile.danceEvery = danceStepper.pos;
                    }
                    textFields.push(danceStepper);

                    var danceLabel = new Label();
                    danceLabel.text = "Dance Interval:";
                    danceLabel.marginTop = 7;

                    var danceBox = new HBox();
                    danceBox.addComponent(danceLabel);
                    danceBox.addComponent(danceStepper);

                    // -- Scale -- \\
                    var scaleStepper = new NumberStepper();
                    scaleStepper.step = 0.1;
                    scaleStepper.pos = curCharFile.scale != null ? curCharFile.scale : 1;
                    scaleStepper.width = 55;
                    scaleStepper.min = 0;
                    scaleStepper.onChange = ()->{
                        curCharFile.scale = scaleStepper.pos;
                    }
                    textFields.push(scaleStepper);

                    var scaleLabel = new Label();
                    scaleLabel.text = "Scale:";
                    scaleLabel.marginTop = 7;

                    var scaleBox = new HBox();
                    scaleBox.addComponent(scaleLabel);
                    scaleBox.addComponent(scaleStepper);

                    daWindow = openWindow("Character Info", [
                        nameBox, 
                        assetPathBox,
                        startingAnimationBox, 
                        offsetsBox, 
                        scaleBox, 
                        singTimeBox, 
                        danceBox,
                        isPixelBox,
                        flipXBox,
                        flipYBox,
                        healthIconButton
                    ], 350, null);
                    daWindow.x = 4;
                    daWindow.y = 50;
                    daHeightThing = daWindow.height;
                }, 150)
            ]
        });

        // Offsets \\
        dropdowns.push({
            open: false,
            buttons: [
                getButton(265, 32, "Clear Anim Offsets", ()-> {
                    setCurrentOffsetX(0);
                    setCurrentOffsetY(0);
                }, 170),
                getButton(265, 32+(22), "Reset Camera", ()-> {
                    zoomTarget = 0.8;
                    targetCamPos = [0, 0];
                }, 170)
            ]
        });


        var charactersDropdown = {
            open: false,
            buttons: []
        };
        
        var charIndex:Int = 0;
        for (i in FileUtil.readDir("mods")) {
            if (FileUtil.directoryExists("mods/" + i + "/data/characters/")) {
                for (file in FileUtil.readDir("mods/" + i + "/data/characters/")) {
                    if (StringTools.endsWith(file, ".json")) {
                        var polyMeta = parseJsonFile("mods/" + i + "/_polymod_meta.json");
                        mods.push(polyMeta.title);
                        var charFile = parseJsonFile("mods/" + i + "/data/characters/" + file);
                        if (charFile != null) {
                            var title = "";
                            if (charFile.name == null) {
                                title = StringTools.replace(file, ".json", " (Unkown Name)");
                            } else {
                                title = charFile.name;
                            }
                            var daPath = "mods/" + i + "/data/characters/" + file;
                            trace(daPath);
                            paths.push(daPath);
                            var daButton = getButton(FlxG.width - 215, 32 + (22*charIndex), title, ()-> {
                                loadCharacter(charFile, "mods/" + i + "/data/characters/" + file);
                                FunkinSound.playOnce(Paths.sound("chartingSounds/noteLay"), 1);
                                for (i in windows) {
                                    i.windowManager.closeWindow(i);
                                }
                            }, 200);
                            charactersDropdown.buttons.push(daButton);
                            trace(title);
                            charIndex++;
                            charFiles.push(charFile);
                        } else {
                            trace("Failed to parse \"" + file + "\"");
                        }
                    }
                    
                }
            }
        }
        var index = 0;
        while (charFiles[index] == null) {
            index++;
        }
        loadCharacter(charFiles[index], paths[index]);

        dropdowns.push(charactersDropdown);


        // Animations \\
        dropdowns.push({
            open: false,
            buttons: [
                //getButton(265, 32, "Clear Anim Offsets", ()-> {
                //}, 120)
            ]
        });

        dropdowns.push({
            open: false,
            buttons: [
                getButton(450, 32 + (22*0), "Psych to V-Slice", ()-> {
                    FileUtil.browseForTextFile("Select Psych Engine Character File", [FileUtil.FILE_FILTER_JSON], (data)->{
                        var convertedFile = Converters.scriptCall("charFromPsych", [Json.parse(data.text)]);
                        FileUtil.browseForSaveFile([FileUtil.FILE_FILTER_JSON], (destPath)->{
                            writeCharFile(fixPath(destPath), convertedFile);
                            FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
                        }, null, data.name);
                    });
                }, 200),
                getButton(450, 32 + (22*1), "Codename to V-Slice", ()-> {
                    FileUtil.browseForTextFile("Select Codename Engine Character File", [FILE_FILTER_XML], (data)->{
                        var convertedFile = Converters.scriptCall("charFromCNE", [Xml.parse(data.text)]);
                        FileUtil.browseForSaveFile([FileUtil.FILE_FILTER_JSON], (destPath)->{
                            writeCharFile(fixPath(destPath), convertedFile);
                            FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
                        }, null, StringTools.replace(data.name, ".xml", ".json"));
                    });
                }, 200)
            ]
        });


        var button = getButton(FlxG.width - 435, 10, "", ()-> {}, 200);
        mainView.addComponent(button);
        //buttons.push(button);
        
        for (i in buttons) {
            i.cameras = [camHUD];
            mainView.addComponent(i);
        }
        for (i in dropdowns) {
            var index = 0;
            for (x in i.buttons) {
                x.visible = false;
                x.textAlign = "left";
                buttons.push(x);
                mainView.addComponent(x);
                index++;
            }
        }
        
        curAnimText = new FlxText(0, 0);
        curAnimText.cameras = [camHUD];
        add(curAnimText);

        infoText = new FlxText(10, 0, null, "Test", 32);
        infoText.font = 'VCR OSD Mono';
        infoText.borderStyle = FlxTextBorderStyle.OUTLINE;
        infoText.borderSize = 2;
        infoText.cameras = [camHUD];
        infoText.y = FlxG.height - infoText.frameHeight;
        add(infoText);

        controlsText = new FlxText(10, 0, null, "Controls:\nReload Character List: R\nSwitch Animation: W, S\nSwitch Onion Anim: Shift + (W, S)\nPlay Current Animation: SPACE\nMove Offset: Left, Down, Up, Right\nMove Offset Extra: Shift + (Left, Down, Up, Right)", 20);
        controlsText.font = 'VCR OSD Mono';
        controlsText.borderStyle = FlxTextBorderStyle.OUTLINE;
        controlsText.borderSize = 1.5;
        controlsText.alignment = "right";
        controlsText.cameras = [camHUD];
        controlsText.x = FlxG.width - (controlsText.frameWidth-23);
        controlsText.y = FlxG.height - (controlsText.frameHeight-45);
        add(controlsText);

        var test = { 
            animations: [
                "test",
                "test2"
            ]
        };
        test.animations.remove("test2");
        trace(test);
        
    }

    function copyObj(from) {
        var daObj = {};
        var things = [];
        for (i in ReflectUtil.getFieldsOf(from)) {
            things.push(i.toString());
        }
        for (i in things) {
            ReflectUtil.setField(daObj, i, ReflectUtil.getField(from, i));
        }
        return daObj;
    }

    function checkIfMatching(obj1, obj2) {
        var matching = true;
        var things = [];
        for (i in ReflectUtil.getFieldsOf(obj1)) {
            things.push(i.toString());
        }
        for (i in things) {
            var value1 = ReflectUtil.getField(obj1, i)+"";
            var value2 = ReflectUtil.getField(obj2, i)+"";
            if (value1 != value2) {
                matching = false;
            }
        }
        return matching;
        //for (i in ["flipX", "flipY", "offsets", "name", "scale"])
    }

    var prevCharFile;
    function loadCharacter(charFile, path, ?skip = false) {
        trace(path);
        currentPath = path;
        curCharFile = charFile;
        
        curChar.frames = Paths.getSparrowAtlas(charFile.assetPath); 
        var animIndex:Int = 0;
        for (i in forceHidden) {
            i = true;
        }
        for (anim in charFile.animations) {
            var fps = anim.frameRate == null ? 24 : anim.frameRate;
            var looped = anim.looped == null ? false : anim.looped;
            var flipX = anim.flipX == null ? false : anim.flipX;
            if (anim.frameIndices != null && anim.frameIndices != []) {
                curChar.animation.addByIndices(anim.name, anim.prefix, anim.frameIndices, null, fps, looped, flipX);
            } else {
                curChar.animation.addByPrefix(anim.name, anim.prefix, fps, looped, flipX);
            }
        }
        if (curChar.animation.exists("idle")) {
            curChar.animation.play("idle");
        }
        if (curChar.animation.exists("danceLeft")) {
            curChar.animation.play("danceLeft");
        }
        curChar.updateHitbox();
        curChar.screenCenter();

        onionSkin.frames = Paths.getSparrowAtlas(charFile.assetPath); 
        var animIndex:Int = 0;
        for (i in forceHidden) {
            i = true;
        }
        for (anim in charFile.animations) {
            var fps = anim.frameRate == null ? 24 : anim.frameRate;
            var looped = anim.looped == null ? false : anim.looped;
            var flipX = anim.flipX == null ? false : anim.flipX;
            if (anim.frameIndices != null && anim.frameIndices != []) {
                onionSkin.animation.addByIndices(anim.name, anim.prefix, anim.frameIndices, null, fps, looped, flipX);
            } else {
                onionSkin.animation.addByPrefix(anim.name, anim.prefix, fps, looped, flipX);
            }
        }
        if (onionSkin.animation.exists("idle")) {
            onionSkin.animation.play("idle");
        }
        if (onionSkin.animation.exists("danceLeft")) {
            onionSkin.animation.play("danceLeft");
        }
        onionSkin.updateHitbox();
        onionSkin.screenCenter();
        if (curCharFile.offsets == null) {
            curCharFile.offsets = [0, 0];
        }

        curCharacter = charFile.name;
        windowTitleSuffix = " - " + curCharacter;

        if (!skip) {
            prevCharFile = parseJsonFile(path);
            if (prevCharFile.offsets == null) {
                prevCharFile.offsets = [0, 0];
            }
        }
        //camCHAR.zoom = 0.8;
        curChar.animation.finish();
        onionSkin.animation.finish();
    }

    function getCurAnimData() {
        for (i in curCharFile.animations) {
            if (i.name == curChar.animation.name) {
                return i;
            }
        }
    }

    function deleteCurAnim() {
        //windowTitleSuffix = " - " + curCharacter + " *";
        unsavedChanges = true;
        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    curCharFile.animations.remove(anim);
                }
            }
        }
    }

    function getCurrentOffsetX() {
        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    return anim.offsets[0];
                }
            }
        }
    }

    function getCurrentOffsetY() {
        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    return anim.offsets[1];
                }
            }
        }
    }

    function setCurrentOffsetX(x:Int) {
        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    anim.offsets[0] = x;
                }
            }
        }
        //unsavedChanges = true;
        //windowTitleSuffix = " - " + curCharacter + " *";
    }
    
    function setCurrentOffsetY(y:Int) {
        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    anim.offsets[1] = y;
                }
            }
        }
        //unsavedChanges = true;
        //windowTitleSuffix = " - " + curCharacter + " *";
    }

    function merge(base: Dynamic, ext: Dynamic) {
        var res = ReflectUtil.copy(base);
        for(f in ReflectUtil.getAnonymousFieldsOf(ext)) ReflectUtil.setAnonymousField(res,f,ReflectUtil.getAnonymousField(res,f));
        return res;
    }

    function writeCharFile(path, jsonFile) {
        var generatedBy = "Nova Character Editor " + editorVersion;
        jsonFile.generatedBy = generatedBy;
        var fileString = Json.stringify(jsonFile, null, "\t");
        FileUtil.writeStringToPath(path, fileString);
        //if (checkFileExists(path)) {
        FileUtil.deleteFile(path);
        //}
        FileUtil.writeStringToPath(path, fileString);
        unsavedChanges = false;
        //windowTitleSuffix = StringTools.replace(windowTitleSuffix, " *", "");
    }

    function fixPath(path) {
        var stringSplit = path.split("\\");
        while (stringSplit[0] != "mods") {
            stringSplit.shift();
        }
        path = stringSplit.join("/");
        return path;
    }

    function saveCharacter() {
        writeCharFile(currentPath, curCharFile);
    }

    function newCharacter() {
        FileUtil.browseForSaveFile([FileUtil.FILE_FILTER_JSON], (path)->{
            writeCharFile(fixPath(path), Json.parse(FileUtil.readStringFromPath("mods/" + currentFolder + "/data/config/templateCharacter.json")));
            FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
        }, null, "template.json");
        
    }

    function saveCharacterAs() {
        FileUtil.browseForSaveFile([FileUtil.FILE_FILTER_JSON], (path)->{
            writeCharFile(fixPath(path), curCharFile);
            FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
        }, null, currentPath);
    }

    function updateWindowHitboxIG() {
        var windowIndex = 0;
        for (obj in windows) {
            if (obj != null) {
                if (windowManager.topMostWindow == obj) {
                    var tophitbox = new FlxSprite();
                    tophitbox.width = obj.width;
                    tophitbox.height = 44;
                    tophitbox.x = obj.x + FlxG.mouse.deltaX;
                    tophitbox.y = obj.y + FlxG.mouse.deltaY;
                    if (FlxG.mouse.overlaps(tophitbox) && FlxG.mouse.pressed) {
                        obj.x += FlxG.mouse.deltaX;
                        obj.y += FlxG.mouse.deltaY;
                        windowTargetY[windowIndex] = obj.y;
                    }
                    if (obj.y < -3 && !FlxG.mouse.pressed) {
                        obj.y = -3;
                    }
                }
            }
            windowIndex++;
        }
    }


    var zoomTarget = 0.8;
    var timer = 0;
    var targetCamPos = [0, 0];

    var windowTargetY = [];

    
    function update(elapsed) {
        super.update(elapsed);
        // for (i in curCharFile.animations) {
        //     if (i.flipX+"" == "null") {
        //         ReflectUtil.setField(i, "flipX", false);
        //         trace(i);
        //     }
        //     if (i.flipY+"" == "null") {
        //         ReflectUtil.setField(i, "flipY", false);
        //         trace(i);
        //     }
        // }
        
        // trace(getCurAnimData().flipX);
        //trace(prevCharFile == curCharFile);
        //trace(prevCharFile.offsets);
        //trace(curCharFile.offsets);
        unsavedChanges = !checkIfMatching(curCharFile, prevCharFile);

        disableInput = false;
        var windowIndex = 0;
        for (child in realDropDowns) {
            if (child.dropDownOpen != null) {
                if (child.dropDownOpen) {
                    disableInput = true;
                    break;
                }
            }
        }
        for (i in windows) {
            if (windowTargetY[windowIndex] == null) {
                windowTargetY[windowIndex] = i.y;
            } else {
                //i.y = MathUtil.coolLerp(i.y, windowTargetY[windowIndex], 0.2);
            }
            if (i.visible) {
                if (FlxG.mouse.overlaps(i)) {
                    disableInput = true;
                    windowTargetY[windowIndex] += FlxG.mouse.wheel*25;
                }
            }
            windowIndex++;
        }
        
        if (FlxG.keys.justPressed.R && !disableInput) {
            FlxG.switchState(ScriptedMusicBeatState.init('CharacterEditor'));
        }
        if (controls.BACK) {
            //FlxG.switchState(() -> new MainMenuState());
        }

       
        

        if (FlxG.keys.justPressed.W && !disableInput) {
            var daChar = FlxG.keys.pressed.SHIFT ? onionSkin : curChar;
            var animIndex = 0;
            for (anim in curCharFile.animations) {
                if (anim.name == daChar.animation.name) {
                    break;
                }
                animIndex++;
            }
            animIndex--;
            if (animIndex < 0) {
                animIndex = curCharFile.animations.length-1;
            }
            daChar.animation.play(curCharFile.animations[animIndex].name, true);
        }

        if (FlxG.keys.justPressed.S && !disableInput) {
            var daChar = FlxG.keys.pressed.SHIFT ? onionSkin : curChar;
            var animIndex = 0;
            for (anim in curCharFile.animations) {
                if (anim.name == daChar.animation.name) {
                    break;
                }
                animIndex++;
            }
            animIndex++;
            if (animIndex > curCharFile.animations.length-1) {
                animIndex = 0;
            }
            daChar.animation.play(curCharFile.animations[animIndex].name, true);
        }
        
        var reset = true;
        for (anim in curCharFile.animations) {
            if (anim.name == curChar.animation.name) {
                reset = false;
            }
        }
        if (reset) {
            curChar.animation.play(curCharFile.animations[0].name);
        }

        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                var daScale = curCharFile.scale != null ? curCharFile.scale : 1;
                for (thing in [curChar, onionSkin]) {
                    thing.flipX = false; 
                    if (curCharFile.flipX != null) {
                        thing.flipX = false;//curCharFile.flipX;
                    }
                    thing.flipY = false; 
                    if (curCharFile.flipY != null) {
                        if (curCharFile.flipY) {
                            thing.flipY = false;//!thing.flipY;
                        }
                    }
                    thing.antialiasing = curCharFile.isPixel != null ? !curCharFile.isPixel : true;
                    if (anim.name == thing.animation.name) {
                        //curChar.updateHitbox();
                        thing.scale.set(daScale, daScale);
                        var offsetX = anim.offsets[0] * daScale;
                        var offsetY = anim.offsets[1] * daScale;
                        thing.x = ((FlxG.width/2) - ((thing.width/2)*daScale)) - (thing.flipX ? -offsetX : offsetX);
                        thing.y = ((FlxG.height/2) - ((thing.height/2)*daScale)) - offsetY;
                        if (curCharFile.offsets != null) {
                            thing.x += curCharFile.offsets[0];
                            thing.y += curCharFile.offsets[1];
                        }
                    }
                }
            }
            
        }

        if (FlxG.keys.justPressed.SPACE && !disableInput) {
            curChar.animation.play(curChar.animation.name, true);
        }
        if (!disableInput) {
            zoomTarget += FlxG.mouse.wheel/10;
            if (zoomTarget < 0.01) {
                zoomTarget = 0.01;
            }
            camCHAR.zoom = MathUtil.coolLerp(camCHAR.zoom, zoomTarget, 0.1); 
        }

        var index:Int = 0;
        var doClose = [];
        //Cursor.applyCursorParams(null, Cursor.CURSOR_DEFAULT_PARAMS);
        for (obj in dropdowns) {
            doClose.push(false);
            var buttonIndex:Int = 0;
            for (button in obj.buttons) {
                button.visible = forceHidden[buttonIndex] ? false : obj.open;
                button.focus = FlxG.mouse.overlaps(button);
                if (FlxG.mouse.justPressed && obj.open) {
                    doClose[index] = true;
                }
                buttonIndex++;
            }
            index++;
        }
        


        
        var isHovering = false;
        var i:Int = 0;
        for (button in buttons) {
            button.focus = FlxG.mouse.overlaps(button);
            if (FlxG.mouse.overlaps(button) && button.visible) {
                isHovering = true;
            }
            if (button.focus && FlxG.mouse.justPressed && button.visible) {
                if (callbacks[i] != null) {
                    callbacks[i]();
                }
            }
            i++;
        }
        if (isHovering) {
            Cursor.cursorMode = CursorMode.Pointer;
            //Cursor.applyCursorParams(Cursor.CURSOR_POINTER_PARAMS.graphic, Cursor.CURSOR_POINTER_PARAMS);
        } else {
            Cursor.cursorMode = CursorMode.Default;
        }

        if (FlxG.mouse.justPressed) {
            FunkinSound.playOnce(Paths.sound("chartingSounds/ClickDown"), 1);
        } else if (FlxG.mouse.justReleased) {
            FunkinSound.playOnce(Paths.sound("chartingSounds/ClickUp"), 1);
        }

        var skipMovement = false;
        for (obj in dropdowns) {
            skipMovement = obj.open ? true : skipMovement;
        }
        for (obj in windows) {
            if (obj != null) {
                try {
                    if (FlxG.mouse.overlaps(obj)) {
                        skipMovement = true;
                    }
                    if (obj.maximized) {
                        obj.windowManager.restoreWindow(obj); 
                    }
                } catch (e:Exception) {
                    // Do nothing about it
                }
               
            }
        }
        updateWindowHitboxIG();

        if (!skipMovement && !disableInput) {
            if (FlxG.mouse.pressed) {
                targetCamPos[0] -= FlxG.mouse.deltaX/zoomTarget;
                targetCamPos[1] -= FlxG.mouse.deltaY/zoomTarget;
            }
            camCHAR.scroll.x = MathUtil.coolLerp(camCHAR.scroll.x, targetCamPos[0], 0.2);
            camCHAR.scroll.y = MathUtil.coolLerp(camCHAR.scroll.y, targetCamPos[1], 0.2);
        } 



        var index:Int = 0;
        for (obj in dropdowns) {
            if (doClose[index]) {
                obj.open = false;
            }
            index++;
        }



        curAnimText.text = "Cur Anim: " + curChar.animation.name;
        curAnimText.updateHitbox();
        curAnimText.screenCenter();
        curAnimText.alpha = 0.6;
        curAnimText.cameras = [camHUD];
        curAnimText.x += 304;
        curAnimText.y = 14;

        if (curCharFile != null) {
            for (anim in curCharFile.animations) {
                if (anim.name == curChar.animation.name) {
                    infoText.text = "Offsets: [x: " + -anim.offsets[0] + ", y: " + -anim.offsets[1] + "]\nNova Character Editor " + editorVersion; 
                    infoText.y = FlxG.height-infoText.frameHeight;
                }
            }
        }

        var daThingX = (FlxG.keys.pressed.SHIFT ? 10 : (FlxG.keys.pressed.CONTROL ? 25 : 1)) * (curChar.flipX ? -1 : 1);
        var daThingY = (FlxG.keys.pressed.SHIFT ? 10 : (FlxG.keys.pressed.CONTROL ? 25 : 1)) * (curChar.flipY ? -1 : 1);
        if (FlxG.keys.justPressed.LEFT && !disableInput) {
            setCurrentOffsetX(getCurrentOffsetX()+daThingX);
        }
        if (FlxG.keys.justPressed.RIGHT && !disableInput) {
            setCurrentOffsetX(getCurrentOffsetX()-daThingX);
        }
        if (FlxG.keys.justPressed.UP && !disableInput) {
            setCurrentOffsetY(getCurrentOffsetY()+daThingY);
        }
        if (FlxG.keys.justPressed.DOWN && !disableInput) {
            setCurrentOffsetY(getCurrentOffsetY()-daThingY);
        }

        windowTitleSuffix = " - " + curCharacter;
        if (unsavedChanges) {
            windowTitleSuffix += " *";
        }

        WindowUtil.setWindowTitle(windowTitlePrefix + "Friday Night Funkin'" + windowTitleSuffix);
        //disableInput = false;
    }

    function destroy() {
        super.destroy();
        WindowUtil.setWindowTitle("Friday Night Funkin'");
    }
}