/* dmenu template config */

/* 
 * You should only edit template.config.h. 
 * config.h is only maintained for Macos
 * builds without the envsubst utility.
 */

static int topbar = 1;                      /* -b  option; if 0, dmenu appears at bottom     */
/* -fn option overrides fonts[0]; default X11 font or font set */
static const char *fonts[] = {
  "Liberation Mono:pixelsize=15"
};
static const char *prompt      = NULL;      /* -p  option; prompt to the left of input field */
static const char *colors[SchemeLast][2] = {
	/* [name]                       fg         bg       */
	[SchemeNorm] =            { "#eceff4", "#2e3440" },
	[SchemeSel] =             { "#eceff4", "#5d62ac" },
	[SchemeSelHighlight] =    { "#febdf7", "#5d62ac" },
	[SchemeNormHighlight] =   { "#81a1c1", "#2e3440" },
	[SchemeOut] =             { "#000000", "#00ffff" },
};
/* -l option; if nonzero, dmenu uses vertical list with given number of lines */
static unsigned int lines      = 0;
static unsigned int lineheight = 30;         /* -h option; minimum height of a menu line     */

/*
 * Characters not considered part of a word while deleting words
 * for example: " /?\"&[]"
 */
static const char worddelimiters[] = " ";

/* Size of the window border */
static unsigned int border_width = 10;
