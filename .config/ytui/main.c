#include <stdio.h>

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
  /* unsigned int bufferLen = getLength(url) * 3; */
  /* char buffer[bufferLen]; */
  return url;
}

int main(int argc, char* argv[]) {
  if (argc == 1) {
    printf("%sUSAGE: ytui [search query]%s\n", RED, NC);
    return 1;
  }

  char* searchStr = urlEncode(getSearchStr(argc, argv));

  printf("searchStr is '%s'\n", searchStr);
  return 0;
}
