#include <stdio.h>

/* ansi color codes */
const char* RED = "\033[31m";
const char* NC = "\033[0m";

/* getSearchStr makes the assumption that a search */
/* string exists to begin with */
char* getSearchStr(int argc, char* argv[]) {
  printf("argc is %i\n", argc);

  char** argArr = argv + sizeof(char);
  int argNum = argc - 1;

  for (unsigned int i = 0; i < argNum; i++) {
  /* printf("firstArg is %s\n", args[0]); */
    printf("arg is %s\n", argArr[i]);
  }


  char* searchStr = "";

  return searchStr;
}

char* urlencode(char* url) {
  return url;
}

int main(int argc, char* argv[]) {
  if (argc == 1) {
    printf("%sUSAGE: ytui [search query]%s\n", RED, NC);
    return 1;
  }

  char* searchStr = getSearchStr(argc, argv);
  /* for (unsigned int i = 0; i < argc; i++) { */
  /*   printf("arg is %s\n", argv[i]); */
  /* } */

  /* if (argvLen > 0) { */
  /*   printf("argv[0] is %s\n", argv[0]); */
  /* } */

  return 0;
}
