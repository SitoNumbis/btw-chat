import { useRef, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";

import loadable from "@loadable/component";

import { scrollTo } from "some-javascript-utils/browser";

// @emotion/css
import { css } from "@emotion/css";

// styles
import styles from "../styles.module.css";

// components
import Loading from "../../../components/Loading/Loading";
const ToBottom = loadable(() => import("../../ToBottom/ToBottom"));
const Message = loadable(() => import("../Message/Message"));

function Messages({
  showConnectionState,
  messages,
  settings,
  selectedChat,
  loading,
}) {
  const messagesList = useRef(null);

  const [canGoBottom, setCanGoBottom] = useState(false);

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
        setCanGoBottom(true);
      else setCanGoBottom(false);
    }
  }, [setCanGoBottom, messagesList]);

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
    if (!canGoBottom)
      setTimeout(() => {
        messagesList.current.scrollTo({
          top: messagesList.current.scrollHeight,
          left: 0,
          behavior: "smooth",
        });
      }, 10);
  }, [canGoBottom]);

  useEffect(() => {
    if (selectedChat && !loading) {
      scrollTo(window.innerHeight);
      setTimeout(() => {
        if (messagesList.current !== null)
          messagesList.current.scrollTo({
            top: messagesList.current.scrollHeight,
            left: 0,
            behavior: "smooth",
          });
      }, 500);
    }
  }, [selectedChat, messagesList, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      id="messages-list"
      ref={messagesList}
      className={`${styles.messages} ${css({
        height: showConnectionState
          ? `calc(${window.innerHeight}px - 170px)`
          : `calc(${window.innerHeight}px - 130px)`,
      })}`}
    >
      <ToBottom canGoBottom={canGoBottom} />
      <p className="text-placeholder-dark italic mx-auto">
        {selectedChat?.bio}
      </p>
      {loading ? (
        <Loading />
      ) : (
        <>
          {messages.map((message, i) => {
            if (i === 0 && messages.length === 0)
              return <Message key={message.date} {...message} />;
            else {
              if (i < messages.length - 1)
                return (
                  <Message
                    key={message.date}
                    {...message}
                    join={message.sender.user === messages[i + 1].sender.user}
                  />
                );
              else return <Message key={message.date} {...message} />;
            }
          })}
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
  }),
  showConnectionState: PropTypes.bool,
};

export default Messages;
