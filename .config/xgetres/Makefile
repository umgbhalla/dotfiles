VERSION ?= 1.0

CPPFLAGS := -I/usr/local/include -DVERSION=\"$(VERSION)\" $(CPPFLAGS)
CFLAGS ?= -O2 -Wall -Werror
LDFLAGS := -L/usr/local/lib -lX11 $(LDFLAGS)

PREFIX ?= /usr/local
BINDIR ?= $(PREFIX)/bin
MANDIR ?= $(PREFIX)/share/man/man1

all: xgetres

xgetres: xgetres.c
	$(CC) $(CPPFLAGS) $(CFLAGS) $? -o $@ $(LDFLAGS)

install: xgetres
	mkdir -p $(BINDIR)
	cp xgetres $(BINDIR)
	mkdir -p $(MANDIR)
	cp xgetres.1 $(MANDIR)/xgetres.1

clean:
	rm -f xgetres

.PHONY: all install clean
