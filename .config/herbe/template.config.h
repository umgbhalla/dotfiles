static const char *background_color = "$HERBE_BG";
static const char *border_color = "$HERBE_BORDER_BG";
static const char *font_color = "$HERBE_FG";
static const char *font_pattern = "$HERBE_FONT";
static unsigned line_spacing = $W_GAPS;
static unsigned int padding = $HERBE_PADDING;

static unsigned int width = $HERBE_WIDTH;
static unsigned int border_size = $W_BORDER_WIDTH;
static unsigned int pos_x = $HERBE_X;
static unsigned int pos_y = $HERBE_Y;

enum corners { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT };
enum corners corner = BOTTOM_RIGHT;

static unsigned int duration = $HERBE_DURATION; /* in seconds */

#define DISMISS_BUTTON Button1
#define ACTION_BUTTON Button3
