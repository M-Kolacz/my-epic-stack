/** @type {import("prettier").Options} */
export default {
	arrowParens: "always",
	bracketSameLine: true,
	bracketSpacing: true,
	embeddedLanguageFormatting: "auto",
	endOfLine: "lf",
	htmlWhitespaceSensitivity: "css",
	insertPragma: false,
	jsxSingleQuote: false,
	printWidth: 80,
	proseWrap: "always",
	quoteProps: "as-needed",
	requirePragma: false,
	semi: true,
	singleAttributePerLine: false,
	singleQuote: false,
	tabWidth: 4,
	trailingComma: "all",
	useTabs: true,
	overrides: [
		{
			files: ["**/*.json"],
			options: {
				useTabs: false,
			},
		},
	],
	plugins: ["prettier-plugin-tailwindcss"],
};
