.POSIX:

NAME    = devour
VERSION = 11.0

CC     ?= cc
CFLAGS += -I/usr/X11R6/include -I/usr/local/include -std=c11 -D_POSIX_C_SOURCE=200809L -Wall -Wextra -pedantic -O2
LDLIBS += -L/usr/X11R6/lib -L/usr/local/lib -s -lX11

BIN_DIR = /usr/local/bin

SRC = devour.c
OBJ = devour.o

all: $(NAME)
$(NAME):
	$(CC) -o $(NAME) $(CFLAGS) $(LDFLAGS) $(LDLIBS) $(SRC)
install: all
	@mkdir -p $(BIN_DIR)
	@mv $(NAME) $(BIN_DIR)
	@rm -f $(OBJ)
	@echo Done moving the binary to ${DESTDIR}${BIN_DIR}
uninstall:
	@rm -f $(BIN_DIR)/$(NAME)
	@echo Done removing the binary from $(BIN_DIR)

.PHONY: all install uninstall
