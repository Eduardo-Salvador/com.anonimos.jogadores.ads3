package site.psi.ads3.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import site.psi.ads3.dto.request.FeedbackRequest;
import site.psi.ads3.dto.response.FeedbackResponse;
import site.psi.ads3.entity.Feedback;
import site.psi.ads3.repository.FeedbackRepository;

@RequiredArgsConstructor
@Service
public class FeedbackService {

    @Autowired
    private final FeedbackRepository feedbackRepository;

    public FeedbackResponse criarFeedback(FeedbackRequest request) {
        Feedback feedback = new Feedback(request.nome(), request.idade(), request.descricao());
        feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    public Page<FeedbackResponse> getAllFeedbacks(Pageable pageable){
        return feedbackRepository.findAll(pageable).map(FeedbackResponse::fromEntity);
    }

    public FeedbackResponse getFeedbackById(Long id) throws IllegalArgumentException {
        Feedback feedback = findFeedbackById(id);
        return FeedbackResponse.fromEntity(feedback);
    }

    public FeedbackResponse updateFeedback(Long id, FeedbackRequest request) throws IllegalArgumentException {
        Feedback feedback = findFeedbackById(id);
        request.updateFeedback(feedback);
        feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    private Feedback findFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
    }
}
