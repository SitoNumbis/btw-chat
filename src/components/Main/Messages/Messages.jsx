import { useMemo, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import useScreenSize from "use-screen-witdh";
import loadable from "@loadable/component";

import { scrollTo } from "some-javascript-utils/browser";

// @emotion/css
import { css } from "@emotion/css";

// utils
import { isSelf } from "../../../utils/users";

// contexts
import { useCanGoBottom } from "../../../context/CanGoBottomProvider";

// styles
import styles from "../styles.module.css";

// components
import Loading from "../../../components/Loading/Loading";

const ToBottom = loadable(() => import("../../ToBottom/ToBottom"));
const Message = loadable(() => import("../Message/Message"));
const SentDate = loadable(() => import("../Message/SentDate"));
const Bubble = loadable(() => import("../Message/Bubble"));

function Messages({ messages, settings, selectedChat, loading, onRetry }) {
  const messagesList = useRef(null);

  const { width } = useScreenSize();

  const { canGoBottomState, setCanGoBottomState } = useCanGoBottom();

  const onScroll = useCallback(() => {
    if (messagesList.current !== null) {
      const top =
        messagesList.current.pageYOffset || messagesList.current.scrollTop;
      if (
        top <
        messagesList.current.scrollHeight -
          messagesList.current.offsetHeight -
          500
      )
        setCanGoBottomState(true);
      else setCanGoBottomState(false);
    }
  }, [setCanGoBottomState, messagesList]);

  useEffect(() => {
    if (messagesList.current !== null) {
      messagesList.current.addEventListener("scroll", onScroll);
      return () => {
        if (messagesList.current !== null) {
          messagesList.current.removeEventListener("scroll", onScroll);
        }
      };
    }
  }, [onScroll, messagesList, settings]);

  const scrollToBottom = useCallback(() => {
    if (!canGoBottomState)
      setTimeout(() => {
        messagesList.current.scrollTo({
          top: messagesList.current.scrollHeight,
          left: 0,
          behavior: "smooth",
        });
      }, 500);
  }, [canGoBottomState]);

  useEffect(() => {
    if (selectedChat && !loading) {
      // scrollTo(window.innerHeight);
      setTimeout(() => {
        if (messagesList.current !== null)
          messagesList.current.scrollTo({
            top: messagesList.current.scrollHeight,
            left: 0,
            behavior: "auto",
          });
      }, 500);
    }
  }, [selectedChat, messagesList, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const listEmotion = useMemo(() => {
    return width > 850
      ? css({
          height: `calc(${window.innerHeight}px - 170px)`,
        })
      : css({ height: `calc(${window.innerHeight}px - 130px)` });
  }, [width]);

  const user = useCallback((sender) => {
    if (sender !== null && sender) return isSelf(sender.user);
  }, []);

  const containerEmotion = useCallback((join) => {
    return css({ marginBottom: join ? "-16px" : "" });
  }, []);

  return (
    <div
      id="messages-list"
      ref={messagesList}
      className={`${styles.messages} ${listEmotion}`}
    >
      <ToBottom />
      <p className="text-placeholder-dark italic mx-auto text-center">
        {selectedChat?.bio}
      </p>
      {loading ? (
        <Loading />
      ) : (
        <>
          {messages.map(
            ({ id, sender, date, message, loading, error, target }, i) => {
              if (i === 0 && messages.length === 0)
                return (
                  <div
                    key={id}
                    className={`w-full flex flex-col ${
                      user(sender) ? "items-end" : "items-start"
                    } ${containerEmotion(false)}`}
                  >
                    <div
                      className={`flex items-end justify-start gap-2 ${
                        user(sender) ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <Message message={message} sender={sender} />
                      <Bubble loading={loading} sender={sender} />
                    </div>
                    <SentDate
                      onRetry={onRetry}
                      error={error}
                      loading={loading}
                      date={date}
                      sender={sender}
                    />
                  </div>
                );
              else {
                if (i < messages.length - 1)
                  return (
                    <div
                      key={id}
                      className={`w-full flex flex-col ${
                        user(sender) ? "items-end" : "items-start"
                      } ${containerEmotion(
                        sender.user === messages[i + 1].sender.user
                      )}`}
                    >
                      <div
                        className={`flex items-end justify-start gap-2 ${
                          user(sender) ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <Message message={message} sender={sender} />
                        <Bubble
                          loading={loading}
                          sender={sender}
                          join={sender.user === messages[i + 1].sender.user}
                        />
                      </div>
                      <SentDate
                        onRetry={onRetry}
                        error={error}
                        loading={loading}
                        date={date}
                        sender={sender}
                        join={sender.user === messages[i + 1].sender.user}
                      />
                    </div>
                  );
                else
                  return (
                    <div
                      key={id}
                      className={`w-full flex flex-col ${
                        user(sender) ? "items-end" : "items-start"
                      } ${containerEmotion(false)}`}
                    >
                      <div
                        className={`flex items-end justify-start gap-2 ${
                          user(sender) ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <Message message={message} sender={sender} />
                        <Bubble loading={loading} sender={sender} />
                      </div>
                      <SentDate
                        onRetry={onRetry}
                        error={error}
                        loading={loading}
                        date={date}
                        sender={sender}
                      />
                    </div>
                  );
              }
            }
          )}
        </>
      )}
    </div>
  );
}

Messages.propTypes = {
  loading: PropTypes.bool,
  settings: PropTypes.bool,
  messages: PropTypes.arrayOf(PropTypes.objectOf),
  selectedChat: PropTypes.shape({
    photo: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
    state: PropTypes.string,
    lastMessage: PropTypes.any,
    key: PropTypes.string,
  }),

  onRetry: PropTypes.func,
};

export default Messages;
