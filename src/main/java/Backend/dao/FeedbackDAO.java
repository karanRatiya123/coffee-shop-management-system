package Backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import Backend.model.Feedback;
import Backend.util.DBConnection;

public class FeedbackDAO {

    public ArrayList<Feedback> getAllFeedback() {

        ArrayList<Feedback> list = new ArrayList<>();

        try {

            Connection con = DBConnection.getConnection();

            String sql = "SELECT * FROM feedback ORDER BY feedback_date DESC";

            PreparedStatement ps = con.prepareStatement(sql);

            ResultSet rs = ps.executeQuery();

            while(rs.next()){

                Feedback feedback = new Feedback();

                feedback.setFeedbackId(rs.getInt("feedback_id"));
                feedback.setCustomerId(rs.getInt("customer_id"));
                feedback.setOrderId(rs.getInt("order_id"));
                feedback.setRating(rs.getInt("rating"));
                feedback.setComments(rs.getString("comments"));
                feedback.setFeedbackDate(rs.getTimestamp("feedback_date"));

                list.add(feedback);
            }

            con.close();

        }catch(Exception e){
            e.printStackTrace();
        }

        return list;
    }

    public Feedback getFeedbackById(int feedbackId){

        Feedback feedback = null;

        try{

            Connection con = DBConnection.getConnection();

            String sql="SELECT * FROM feedback WHERE feedback_id=?";

            PreparedStatement ps=con.prepareStatement(sql);

            ps.setInt(1,feedbackId);

            ResultSet rs=ps.executeQuery();

            if(rs.next()){

                feedback=new Feedback();

                feedback.setFeedbackId(rs.getInt("feedback_id"));
                feedback.setCustomerId(rs.getInt("customer_id"));
                feedback.setOrderId(rs.getInt("order_id"));
                feedback.setRating(rs.getInt("rating"));
                feedback.setComments(rs.getString("comments"));
                feedback.setFeedbackDate(rs.getTimestamp("feedback_date"));

            }

            con.close();

        }catch(Exception e){
            e.printStackTrace();
        }

        return feedback;
    }

    public boolean addFeedback(Feedback feedback) {
        boolean status = false;
        try {
            Connection con = DBConnection.getConnection();
            String sql = "INSERT INTO feedback(customer_id, order_id, rating, comments, feedback_date) VALUES(?, ?, ?, ?, NOW())";
            PreparedStatement ps = con.prepareStatement(sql);
            if (feedback.getCustomerId() > 0) {
                ps.setInt(1, feedback.getCustomerId());
            } else {
                ps.setNull(1, java.sql.Types.INTEGER);
            }
            if (feedback.getOrderId() > 0) {
                ps.setInt(2, feedback.getOrderId());
            } else {
                ps.setNull(2, java.sql.Types.INTEGER);
            }
            ps.setInt(3, feedback.getRating());
            ps.setString(4, feedback.getComments());

            int count = ps.executeUpdate();
            if (count > 0) {
                status = true;
            }
            ps.close();
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status;
    }
}