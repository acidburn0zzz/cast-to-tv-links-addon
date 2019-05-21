/*
cast-to-tv-links-addon
Developer: Rafostar
Extension GitHub: https://github.com/Rafostar/cast-to-tv-links-addon
*/

const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Local = imports.misc.extensionUtils.getCurrentExtension();
const Widget = Local.imports.widget;
const Convenience = Local.imports.convenience;
const extensionsPath = Local.path.substring(0, Local.path.lastIndexOf('/'));
const mainPath = extensionsPath + '/cast-to-tv@rafostar.github.com';
imports.searchPath.unshift(mainPath);
const Addons = imports.addons;

let castMenu;
let addonMenuItem;
let timeout;

function init()
{
	Convenience.initTranslations();
}

function enable()
{
	if(!timeout)
	{
		/* Give main extension time to finish startup */
		timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () =>
		{
			timeout = null;

			castMenu = Addons.findCastToTv();
			if(castMenu)
			{
				addonMenuItem = new Widget.addonMenuItem();
				castMenu.castSubMenu.menu.addMenuItem(addonMenuItem);

				if(castMenu.isServiceEnabled === false) addonMenuItem.actor.hide();
				if(castMenu.serviceMenuItem) Addons.setLastMenuItem(castMenu, castMenu.serviceMenuItem);
				if(castMenu.settingsMenuItem) Addons.setLastMenuItem(castMenu, castMenu.settingsMenuItem);
			}

			return GLib.SOURCE_REMOVE;
		});
	}
}

function disable()
{
	if(timeout) GLib.source_remove(timeout);

	if(addonMenuItem)
	{
		/* No need to reorder menu items when locking screen,
		as whole cast menu will be destroyed then anyway */
		let lockingScreen = (Main.sessionMode.currentMode == 'unlock-dialog'
			|| Main.sessionMode.currentMode == 'lock-screen');

		if(!lockingScreen) Addons.setLastMenuItem(castMenu, addonMenuItem);

		addonMenuItem.destroy();
	}

	castMenu = null;
	addonMenuItem = null;
	timeout = null;
}
