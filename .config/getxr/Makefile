BINARY=getxr

PREFIX=/usr/local
BIN=$(PREFIX)/bin

CP=cp -f
RM=rm -rf
MKDIR=mkdir -p

CFLAGS+=-O2 -I/usr/local/include -I/usr/X11R6/include
LDFLAGS+=-L/usr/local/lib -L/usr/X11R6/lib -lX11

all:
	$(CC) $(CFLAGS) $(LDFLAGS) -o $(BINARY) main.c
	
clean:
	$(RM) $(BINARY) *.o

install: all
	$(MKDIR) $(BIN)
	$(CP) $(BINARY) $(BIN)/$(BINARY)

uninstall:
	$(RM) $(BIN)/$(BINARY)
	

.PHONY: all clean install uninstall

