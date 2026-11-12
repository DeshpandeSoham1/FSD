import {
  DEPOSIT_SHARE,
  MAX_RENT_SHARE,
  MAX_RENTAL_DAYS,
  MIN_DEPOSIT,
  MIN_RENT,
  NEW_USER_VALUE_LIMIT,
  formatRupees,
} from "../data";
import Modal from "./Modal";

export default function PolicyModal({ onClose }) {
  return (
    <Modal title="Damage & Deposit Policy" onClose={onClose}>
      <ul className="policy-list">
        <li>
          Deposit is {DEPOSIT_SHARE * 100}% of the item's original price (minimum {formatRupees(MIN_DEPOSIT)}). Pay it to
          the owner at handover by cash or UPI. It comes back when the item is returned safely.
        </li>
        <li>
          Rent starts at {formatRupees(MIN_RENT)}/day and can't be more than {MAX_RENT_SHARE * 100}% of the item's price
          per day. Rentals run 1–{MAX_RENTAL_DAYS} days.
        </li>
        <li>Normal wear: no charge.</li>
        <li>Minor damage: borrower pays the repair cost, up to the deposit.</li>
        <li>Major damage or loss: borrower pays the depreciated value, up to the original price.</li>
        <li>Late return: one extra day's rent for every late day.</li>
        <li>Clothing and sleeping bags are cleaned by the owner between rentals. Stains or tears count as damage.</li>
        <li>Disputes go to the club coordinator or campus admin for a final decision.</li>
        <li>
          New users can borrow items worth up to {formatRupees(NEW_USER_VALUE_LIMIT)} until they finish two rentals.
          Two unresolved damage or late cases lead to suspension.
        </li>
      </ul>
    </Modal>
  );
}
