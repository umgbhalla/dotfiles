BINARY=getxr

PREFIX=/usr/local
BIN=$(PREFIX)/bin

CFLAGS+=-O2 -I/usr/local/include -I/usr/X11R6/include
LDFLAGS+=-L/usr/local/lib -L/usr/X11R6/lib -lX11

all:
	$(CC) $(CFLAGS) $(LDFLAGS) -o $(BINARY) main.c
	
clean:
	@rm -f $(BINARY) *.o

install:
	@mkdir -p $(BIN)
	@mv $(BINARY) $(BIN)/$(BINARY)

uninstall:
	@rm -f $(BIN)/$(BINARY)
	

.PHONY: all clean install uninstall

