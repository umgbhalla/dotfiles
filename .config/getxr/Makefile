BINARY=getxr

PREFIX=/usr/local
BIN=$(PREFIX)/bin

CP=cp -f
RM=rm -rf
MKDIR=mkdir -p

CFLAGS= -O2 -lX11

all:
	$(CC) $(CFLAGS) -o $(BINARY) main.c
	
clean:
	$(RM) $(BINARY) *.o

install: all
	$(MKDIR) $(BIN)
	$(CP) $(BINARY) $(BIN)/$(BINARY)

uninstall:
	$(RM) $(BIN)/$(BINARY)
	

.PHONY: all clean install uninstall

