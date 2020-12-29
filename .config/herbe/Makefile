CFLAGS = -Wall -Wextra -pedantic -I/usr/local/include -I/usr/X11R6/include -L/usr/local/lib -L/usr/X11R6/lib -lX11 -lXft -I/usr/local/include/freetype2 -I/usr/include/freetype2 -I/usr/X11R6/include/freetype2 -pthread

PREFIX ?= /usr/local
CC ?= cc

all: herbe

herbe: herbe.c
	$(CC) herbe.c $(CFLAGS) -o herbe

install: herbe
	mkdir -p ${DESTDIR}${PREFIX}/bin
	cp -f herbe ${DESTDIR}${PREFIX}/bin

uninstall:
	rm -f ${DESTDIR}${PREFIX}/bin/herbe

clean:
	rm -f herbe

.PHONY: all install uninstall clean
