PREFIX=/usr/local
BIN=$(PREFIX)/bin

BINARY=ytui

CP=cp -f
RM=rm -f
MKDIR_P=mkdir -p

CFLAGS = -O2

all:
	$(CC) $(CFLAGS) $(LDFLAGS) -o $(BINARY) main.c

install: all
	$(MKDIR_P) $(BIN)
	$(CP) $(BINARY) $(BIN)/$(BINARY)

clean:
	$(RM) $(BINARY)

uninstall:
	$(RM) $(BIN)/$(BINARY)

.PHONY: all install clean uninstall
