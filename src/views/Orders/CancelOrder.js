import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ make sure you installed react-toastify
import { API_BASE_URL } from 'src/config';

const CancelOrder = ({ open, onClose, orderno, onCancelled }) => {
  const [loading, setLoading] = useState(false);

const handleConfirmCancel = async () => {
  if (!orderno) return;
  setLoading(true);
  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/orders/${orderno}/cancel`,
      {}, // no body, just params
      { withCredentials: true }
    );

    toast.success(res.data.message || "Order cancelled successfully");
    onCancelled(orderno);
    onClose();
  } catch (err) {
    console.error("Cancel error:", err.response?.data || err.message);
    const msg =
      err.response?.data?.details || // backend error detail
      err.response?.data?.error ||   // backend error field
      "Something went wrong while cancelling the order.";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cancel Order</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to cancel order #{orderno}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          No
        </Button>
        <Button
          onClick={handleConfirmCancel}
          color="error"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Yes, Cancel Order"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelOrder;
