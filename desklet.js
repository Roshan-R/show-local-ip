const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Soup = imports.gi.Soup;
const Util = imports.misc.util;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;


function ShowLocalIPDesklet(metadata, desklet_id) {
    this._init(metadata, desklet_id);
}

ShowLocalIPDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id) {
        Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

        this.configFile = GLib.get_home_dir() + "/.local/share/cinnamon/desklets/showlocalip@Roshan-R/metadata.json";
        this._menu.addAction("Edit Config", Lang.bind(this, function() {
            Util.spawnCommandLine("xdg-open " + this.configFile);
        }));

        this.window = new St.Bin();
        this.text = new St.Label();
        this.text.style = "font-size: " + metadata["font-size"];
        this.window.add_actor(this.text);
        this.setContent(this.window);

        this._tick();

    },

    _tick: function() {
        this._update_ip();
        this.timeout = Mainloop.timeout_add_seconds(60, this._tick.bind(this));
    },

    _get_lan_ip: function() {
        // taken from https://github.com/Josholith/gnome-extension-lan-ip-address/blob/master/extension.js
        var command_output_bytes = GLib.spawn_command_line_sync('ip route get 1.1.1.1')[1];
        var command_output_string = '';

        for (var current_character_index = 0; current_character_index < command_output_bytes.length;
            ++current_character_index) {
            var current_character = String.fromCharCode(command_output_bytes[current_character_index]);
            command_output_string += current_character;
        }

        var Re = new RegExp(/src [^ ]+/g);
        var matches = command_output_string.match(Re);
        var lanIpAddress;
        if (matches) {
            lanIpAddress = matches[0].split(' ')[1];
        } else {
            lanIpAddress = '';
        }
        return lanIpAddress;
    },

    _update_ip: function() {
        var ip = this._get_lan_ip();
        if(ip){
            this.text.set_text(ip);
        }
        else{
            this.text.set_text('failed to get ip address')
        }

    },

    on_desklet_clicked: function(event) {
        this.text.set_text("Getting IP address..");
        this._update_ip();
    },

    on_desklet_removed: function() {
        Mainloop.source_remove(this.timeout);
    }
};

function main(metadata, desklet_id) {
    return new ShowLocalIPDesklet(metadata, desklet_id);
}