#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* ansi color codes */
const char* RED = "\033[31m";
const char* NC = "\033[0m";

unsigned int getLength(char* str) {
  /* manual strlen for practice */
  unsigned int c = 0;
  while (str[c] != '\0') c++;
  return c;
}

/* getSearchStr makes the assumption that a search */
/* string exists to begin with */
char* getSearchStr(int argc, char* argv[]) {
  /* remove binary name from args */
  char** argArr = argv + sizeof(char);
  int argNum = argc - 1;

  for (unsigned int i = 0; i < argNum - 1; i++) {
    unsigned int c = getLength(argArr[i]);

    /* replace NUL characters in between each string */
    /* with a SPACE character (effectively joining all */
    /* arguments with spaces) */
    argArr[i][c] = ' ';
  }

  return argArr[0];
}

char* urlEncode(char* url) {
  /* at a maximum, every character could be converted */
  /* to a three character string */
  unsigned int bufferLen = getLength(url) * 3;
  char* buffer = (char*) malloc(sizeof(char) * bufferLen);
  /* buffer char counter */
  unsigned int bc = 0;
  /* url char counter */
  unsigned int c = 0;

  while (url[c] != '\0') {
    /* printf("char is %c\n", url[c]); */

    switch (url[c]) {
      case ' ': {
        *(buffer+bc) = '%';
        bc++;
        *(buffer+bc) = '2';
        bc++;
        *(buffer+bc) = '0';
        break;
      }
      case '\'': {
        *(buffer+bc) = '%';
        bc++;
        *(buffer+bc) = '9';
        bc++;
        *(buffer+bc) = '1';
        break;
      }
      case '%': {
        *(buffer+bc) = '%';
        bc++;
        *(buffer+bc) = '2';
        bc++;
        *(buffer+bc) = '5';
        break;
      }
      default: {
        *(buffer+bc) = url[c];
      }
    }

    bc++;
    c++;
  }

  return buffer;
}

int main(int argc, char* argv[]) {
  if (argc == 1) {
    printf("%sUSAGE: ytui [search query]%s\n", RED, NC);
    return 1;
  }

  char* searchStr = urlEncode(getSearchStr(argc, argv));
  const char* FQDN = "https://www.youtube.com";
  const char* RESOURCE_SEARCH_RESULTS = "/results?search_query=";

  unsigned int searchStrLen = getLength(searchStr);
  unsigned int domainLen = getLength((char*) FQDN);
  unsigned int resourceLen = getLength((char*) RESOURCE_SEARCH_RESULTS);

  char* searchUrl = (char*) malloc(sizeof(char)* (searchStrLen + domainLen + resourceLen));

  strcat(searchUrl, FQDN);
  strcat(searchUrl, RESOURCE_SEARCH_RESULTS);
  strcat(searchUrl, searchStr);

  printf("url is %s\n", searchUrl);

  free(searchStr);
  free(searchUrl);

  /* GET /http-get-and-post-methods-example-in-c/ HTTP/1.1 */
  /* Host: www.aticleworld.com */
  /* Content-Type: text/plain */

  return 0;
}
