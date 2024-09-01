import React, { useState } from 'react';
import { Button, Popover } from '@mui/material';
import EmojiPicker from 'emoji-picker-react';

const EmojiPickerButton = ({ onEmojiSelect }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setShowPicker(!showPicker);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    console.log('Emoji selected:', emojiObject);
    onEmojiSelect(emojiObject.emoji); // Asegúrate de pasar el emoji seleccionado
    handleClose();
  };

  return (
    <div>
      <Button
        aria-controls={showPicker ? 'emoji-picker' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        variant="contained"
      >
        😊
      </Button>
      <Popover
        id="emoji-picker"
        open={showPicker}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
    </div>
  );
};

export default EmojiPickerButton;
