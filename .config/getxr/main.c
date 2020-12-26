#include <stdio.h>
#include <stdlib.h>
#include <X11/Xlib.h>

/* get string length */
unsigned int length(char* str) {
  unsigned int c = 0;
  while (*(str+c) != '\0')
    c++;
  return c;
}

/* get index of substring in string */
int index_of(char* src, char* substr) {
  int result = -1;

  /* short circuit logic */
  if (*src == '\0' || *substr == '\0')
    return result;

  int ci = 0;
  int ci_sub = 0;
  char c;
  char c_sub;
  while ((c = *(src+ci)) != '\0') {
    c_sub = *(substr+ci_sub);

    /* all previous substring characters have matched */
    if (c_sub == '\0')
      break;

    if (c == c_sub) {
      /* result is set to the index of the first char */
      if (result == -1)
        result = ci;

      ci_sub++;
    } else {
      result = -1;
      ci_sub = 0;
    }

    ci++;
  }

  return result;
}

int is_whitespace(char c) {
  int is_whitespace = 0;
  if (c == ' ' ||
      c == '\t' ||
      c == '\n' ||
      c == '\v' ||
      c == '\f' ||
      c == '\r')
    is_whitespace = 1;

  return is_whitespace;
}

/* main */
int main(int argc, char* argv[]) {
  if (argc < 2) {
    const char* RED = "\033[31m";
    const char* NC = "\033[0m";
    printf("%sUSAGE: getxr [resource]%s\n", RED, NC);
    return 1;
  }

  char* resource = argv[1];

  /* get default DISPLAY env variable */
  Display* display = XOpenDisplay(NULL);

  /* retrieve loaded x resources */
  char* xresources = XResourceManagerString(display);

  int resource_index = index_of(xresources, resource);
  int resource_length = length(resource);

  if (resource_index < 0 ||
      *(xresources+resource_index+resource_length) != ':') {
    printf("");
    return 1;
  }

  /* trim start */
  /* add 1 to resource length to include colon separator */
  xresources = xresources + resource_index + resource_length + 1;
  while (is_whitespace(*xresources))
    xresources++;

  /* trim end */
  int end_index = 0;
  while (!is_whitespace(*(xresources+end_index)))
    end_index++;

  char* resource_value = (char*) malloc(sizeof(char) * (end_index+1));

  int c = 0;
  while (c < end_index) {
    *(resource_value+c) = *(xresources+c);
    c++;
  }
  *(resource_value+end_index) = '\0';

  printf("%s\n", resource_value);

  free(resource_value);
}
