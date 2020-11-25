#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * constants
 */

const char* ICON_PADDING = "7";

/*
 * utilities
 */

char* getcommand(char* command, unsigned int bufsize) {
  FILE* fp;
  char* out = malloc(sizeof(char) * bufsize);

  fp = popen(command, "r");
  if (fp == NULL) { return ""; }

  int c;
  int i = 0;

  /* loop invariant is just a sanity check */
  while (i < bufsize) {
    c = fgetc(fp);

    if (feof(fp) ||
      /* suppress new lines */
      c == '\n')
      break;

    *(out+i) = c;
    i++;
  }

  /* sanity check */
  int length = strlen(out);
  if (out[length-1] == '\n') {
    out[length-1] = '\0';
  }

  pclose(fp);

  return out;
}

/*
 * modules
 */

char* wm() {
  char* wmcmd = "bspc query -D --names -d";
  wmcmd = getcommand(wmcmd, 4);

  /* if (strncmp(wmcmd, "I", 2) == 0) { */
  /* } */
  /* case "$ws" in */
  /*   "I")    title="%{O$ICON_PADDING}develop" ;; */
  /*   "II")   title="%{O$ICON_PADDING}browse " ;; */
  /*   "III")  title="%{O$ICON_PADDING}game   " ;; */
  /*   "IV")   title="%{O$ICON_PADDING}chat   " ;; */
  /*   "V")    title="%{O$ICON_PADDING}media  " ;; */
  /*   "IX")   title="%{O$ICON_PADDING}news   " ;; */
  /*   "X")    title="%{O$ICON_PADDING}music  " ;; */
  /* esac */

  /* title="$(echo "$title" | tr "[a-z]" "[A-Z]")" */
  /* echo "%{B$BG} ${title} %{B-}" */

  return wmcmd;
}

char* clock(char* FG, char* BG) {
  unsigned int size = 64;
  char* clockcmd = "date \"+%m.%d %a %H:%M\" | tr \"[a-z]\" \"[A-Z]\"";

  char* clockpre = getcommand(clockcmd, size);
  char* clockout = malloc(sizeof(char) * size);
  snprintf(clockout, size, "%%{B%s} %%{O%s}%s %%{B-}", BG, ICON_PADDING, clockpre);

  free(clockpre);
  return clockout;
}

char* spaceleft(char* FG, char* BG) {
  unsigned int size = 64;

  char* out = malloc(sizeof(char) * size);
  snprintf(out, size,
      "%%{B%s}%%{O%s}%%{O%s}%%{B-}%%{O%s}%%{B%s}%%{O%s}%%{B-} ",
       BG, ICON_PADDING, ICON_PADDING, ICON_PADDING, BG, ICON_PADDING);

  return out;
}

char* spaceright(char* FG, char* BG) {
  unsigned int size = 64;

  char* out = malloc(sizeof(char) * size);
  snprintf(out, size,
      " %%{B%s}%%{O%s}%%{B-}%%{O%s}%%{B%s}%%{O%s}%%{O%s}%%{B-}",
       BG, ICON_PADDING, ICON_PADDING, BG, ICON_PADDING, ICON_PADDING);

  return out;
}

/*
 * main
 */

int main() {
  /* setup */
  char* FG = getcommand("xgetres \"bar.foreground\"", 8);
  char* BG = getcommand("xgetres \"bar.background\"", 8);

  /* modules */
  char* _spaceleft = spaceleft(FG, BG);
  char* _wm = wm();
  char* _clock = clock(FG, BG);
  char* _spaceright = spaceright(FG, BG);

  /* output */
  printf("%%{l}%s%s%%{r}%s%s\n",
      _spaceleft,
      _wm,
      _clock,
      _spaceright);

  /* free memory */
  free(FG);
  free(BG);

  free(_spaceleft);
  free(_wm);
  free(_clock);
  free(_spaceright);
}
