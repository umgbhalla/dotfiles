static const char *background_color = "$HERBE_BG";
static const char *border_color = "$HERBE_BG_ALT";
static const char *font_color = "$HERBE_FG";
static const char *font_pattern = "$HERBE_FONT";
static const unsigned line_spacing = 5;
static const unsigned int padding = $W_GAPS;

static const unsigned int width = $HERBE_WIDTH;
static const unsigned int border_size = $W_BORDER_WIDTH;
static const unsigned int pos_x = $HERBE_X;
static const unsigned int pos_y = $HERBE_Y;

enum corners { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT };
enum corners corner = TOP_RIGHT;

static const unsigned int duration = $HERBE_DURATION; /* in seconds */

#define DISMISS_BUTTON Button1
#define ACTION_BUTTON Button3
