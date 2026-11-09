// Keep the desktop method order here. When winget is approved, add it at the
// beginning of this array and update public/llms.txt and public/llms-full.txt.
export interface InstallMethod {
	id: string;
	title: string;
	prerequisite: string;
	install: string;
	installLanguage: 'powershell' | 'text';
	details: string;
	update: string;
	uninstall: string;
}

export const desktopInstallMethods: InstallMethod[] = [
	{
		id: 'install-with-scoop',
		title: 'Install with Scoop',
		prerequisite: 'Scoop is installed.',
		install: 'scoop bucket add xrmghost https://github.com/xrmghost/xrmghost\nscoop install xrmghost/xg',
		installLanguage: 'powershell',
		details: 'Scoop installs the signed, self-contained `xg.exe` and its host. Open a new shell, then run `xg --version`.',
		update: '`scoop update xg`',
		uninstall: '`scoop uninstall xg`',
	},
	{
		id: 'install-with-powershell',
		title: 'Install with PowerShell',
		prerequisite: 'Windows PowerShell 5.1 or PowerShell 7. No .NET SDK is required.',
		install: 'irm https://github.com/xrmghost/xrmghost/releases/latest/download/install.ps1 | iex',
		installLanguage: 'powershell',
		details: 'The script installs for the current user in `%LOCALAPPDATA%\\Programs\\XrmGhost\\cli` and changes only the user `PATH`. Open a new shell, then run `xg --version`. To select a specific version, set `$env:XG_VERSION` before running the command.',
		update: 'Run the same command again.',
		uninstall: 'Delete `%LOCALAPPDATA%\\Programs\\XrmGhost\\cli` and remove that entry from your user `PATH`.',
	},
	{
		id: 'install-from-the-signed-zip',
		title: 'Install from the signed ZIP',
		prerequisite: 'Windows x64. Download the ZIP manually from the release page.',
		install: 'https://github.com/xrmghost/xrmghost/releases/latest',
		installLanguage: 'text',
		details: 'Download the signed `xrmghost-cli-<version>-full.zip`. Extract the entire archive without moving `bin\\`, then add the folder containing `xg.exe`—not `bin\\`—to your user `PATH`. Open a new shell and run `xg --version`.',
		update: 'Download a newer `xrmghost-cli-<version>-full.zip` and extract it over the same folder so `xg.exe` and `bin\\` move together.',
		uninstall: 'Delete the extracted folder and remove it from your user `PATH`.',
	},
];
